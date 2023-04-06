// ------------------------------
// Import required modules
// ------------------------------
require('dotenv').config(); // Loads environment variables from .env file
const express = require('express');
const app = express(); // Create an instance of the Express application
const mongoose = require('mongoose');
const path = require('path');
const mealsController = require('./controllers/meals');
const Meal = require('./models/Meals');
const PORT = process.env.PORT || 3000;
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const flash = require('connect-flash');



// ------------------------------
// Middleware configuration
// ------------------------------
app.set("view engine", "ejs");
app.use(express.static(__dirname));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'your-session-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // using connect-flash middleware


// ------------------------------
// MongoDB configuration
// ------------------------------
mongoose.set('strictQuery', false);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected on: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

// ------------------------------
// Passport.js configuration
// ------------------------------
passport.use(new LocalStrategy({ usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email });

      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Passport.js serialization and deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


// ------------------------------
// Authentication routes
// ------------------------------

// Login routes
app.get('/login', (req, res) => {
  const errorMessage = req.flash('error'); // Get the error message from connect-flash
  res.render('login', { isLoggedIn: req.isAuthenticated(), errorMessage: errorMessage });
});
app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: 'Invalid email or password.' }));

// Register route
app.get('/register', (req, res) => {
  res.render('register', { isLoggedIn: req.isAuthenticated() });
});

// Logout route // Using Referer to stay on the same page as we currently are 
app.get('/logout', (req, res) => {
  req.logout(() => {
    const returnUrl = req.header('Referer') || '/';
    res.redirect(returnUrl);
  });
});

// Contact route
app.get('/contact', (req, res) => {
  res.render('contact');
});
// About route
app.get('/about', (req, res) => {
  res.render('about');
});
// Review route
app.get('/reviews', (req, res) => {
  res.render('reviews');
});
// ------------------------------
// Meal-related routes
// ------------------------------

// Home page route
app.get('/', async (req, res) => {
  try {
    const meals = await Meal.aggregate([
      { $match: { description: { $ne: null } } },
      { $sample: { size: 4 } }
    ]);

    if (req.isAuthenticated()) {
      res.render("index", { meals: meals, user: req.user, isLoggedIn: true });
    } else {
      res.render("index", { meals: meals, user: null, isLoggedIn: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong.");
  }
});


// Route for retrieving all meals from the database
app.get('/meals', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const pageWindow = 2;
    console.log("Retrieving all meals...");
    const meals = await Meal.aggregate([
      {
        $match: {
          $expr: {
            $gte: [
              { $strLenCP: { $ifNull: ["$description", ""] } },
              20
            ]
          }
        }
      },
      { $skip: skip },
      { $limit: 10 }
    ]);
    console.log("Meals retrieved:", meals);
    const isLoggedIn = req.isAuthenticated(); // Check if the user is logged in

    const mealCount = await Meal.countDocuments();
    const pageCount = Math.ceil(mealCount / 10);
    const startPage = Math.max(page - pageWindow, 1);
    const endPage = Math.min(page + pageWindow, pageCount);
    

    if (meals) { // If meals are found
      res.render('meals', {
        meals: meals,
        isLoggedIn: isLoggedIn,
        isFilterSearch: false,
        user: req.user, // Pass the user object if available
        pageCount: pageCount,
        currentPage: 1,
        startPage: startPage,
        endPage: endPage,
        query: '', // Pass an empty string for the query variable
        page: req.query.page || 1
      }); // Render the meals.ejs view and pass the meals, isLoggedIn, and user to it
    } else {
      res.send("Something went wrong."); // Send an error message as the response
    }
  } catch (error) {
    console.log('Error in retrieving all meals route:', error);
    res.status(500).send("Something went wrong in retrieving all meals route.");
  }
});




// Route for searching meals
app.get('/search', async (req, res) => {
  const query = req.query.q || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const isLoggedIn = req.isAuthenticated();
  const user = req.user;
  
  try {
    const meals = await Meal.find({ name: new RegExp(query, 'i'),description: { $ne: null } })
      .skip(skip)
      .limit(limit)
      .exec();

    const mealCount = await Meal.countDocuments({ name: new RegExp(query, 'i') });
    const pageCount = Math.ceil(mealCount / limit);

    const pageWindow = 2;
    const startPage = Math.max(page - pageWindow, 1);
    const endPage = Math.min(page + pageWindow, pageCount);

    res.render('meals', {
      meals,
      isLoggedIn,
      user,
      isFilterSearch: false,
      pageCount: pageCount,
      currentPage: page,
      query,
      startPage,
      endPage,
      page: req.query.page || 1,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error occurred while searching meals');
  }
});



// Route to search by specific filters
app.get('/filter-search', async (req, res) => {
  const include = req.query.ingredient ? req.query.ingredient.split(',') : [];
  const exclude = req.query.exclude ? req.query.exclude.split(',') : [];
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  try {
    const meals = await Meal.find({description: { $ne: null },description: { $ne: null }})
    .limit(limit)
    .skip(skip);
    const filteredMeals = meals.filter(meal => {
    const ingredients = meal.ingredients.split(',').map(i => i.trim().toLowerCase());
    const includeExists = include.every(ingredient => ingredients.includes(ingredient.toLowerCase()));
    const excludeExists = exclude.some(ingredient => ingredients.includes(ingredient.toLowerCase()));
    return includeExists && !excludeExists;
    });

    const pageCount = Math.ceil(filteredMeals.length / limit);

    res.render('meals', {
      meals: filteredMeals.slice(skip, skip + limit),
      isLoggedIn: req.isAuthenticated(),
      user: req.user,
      isFilterSearch: true,
      pageCount: pageCount,
      currentPage: page,
      include: include,
      exclude: exclude,
      page: req.query.page || 1
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
//Update meal route
app.get('/update-meal/:id', async (req, res) => {
  const mealId = req.params.id;
  const returnUrl = req.query.returnUrl;

  try {
    const meal = await Meal.findById(mealId);
    res.render('update-meal', { meal, returnUrl, isLoggedIn: req.isAuthenticated(), user: req.user });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

//Sending the updated meal into the database
app.post("/update-meal/:id", async (req, res) => {


  try {
    const mealId = req.params.id;
    const meal = await Meal.findById(mealId);
    const ingredientsArray = req.body.ingredients;
    const stepsArray = req.body.steps;
    console.log(stepsArray);
   // const ingredients = JSON.stringify(ingredientsArray);
   // const steps = JSON.stringify(stepsArray);
    console.log("Atfter Stringify: "+stepsArray);

    meal.description = req.body.description;
    meal.ingredients = ingredientsArray;
    meal.steps = stepsArray;
    
    console.log(meal.steps);
    await meal.save();

    res.redirect(decodeURIComponent(req.query.returnUrl));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating meal');
  }
});




// Connect to MongoDB and start the server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on the port: ${PORT}`); // Log the port the server is listening on
  });
});

