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

// Logout route
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
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
      { $limit: 10 }
    ]);

    const isLoggedIn = req.isAuthenticated(); // Check if the user is logged in

    if (meals) { // If meals are found
      res.render('meals', {
        meals: meals,
        isLoggedIn: isLoggedIn,
        user: req.user // Pass the user object if available
      }); // Render the meals.ejs view and pass the meals, isLoggedIn, and user to it
    } else {
      res.send("Something went wrong."); // Send an error message as the response
    }
  } catch (error) {
    console.log(error); // Log any errors
    res.status(500).send("Something went wrong.");
  }
});

// Route for searching meals
app.get('/search', async (req, res) => {
  const query = req.query.q || '';
  const limit = 10;
  const isLoggedIn = req.isAuthenticated();
  const user = req.user;

  try {
    const meals = await Meal.find({ name: new RegExp(query, 'i') })
      .limit(limit)
      .exec();

    res.render('meals', { meals, isLoggedIn, user });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error occurred while searching meals');
  }
});

// Connect to MongoDB and start the server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on the port: ${PORT}`); // Log the port the server is listening on
  });
});

