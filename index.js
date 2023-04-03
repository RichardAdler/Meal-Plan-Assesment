// Import required modules
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


/**
 * Controllers (route handlers).
 */


app.set("view engine", "ejs");
app.use(express.static(__dirname));
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'your-session-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


// Configure Mongoose to use some specific options
mongoose.set('strictQuery', false);

// Create a function to connect to MongoDB and handle any errors
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI); // Connect to MongoDB
    console.log(`MongoDB Connected on: ${conn.connection.host}`); // Log connection host
  } catch (error) {
    console.log(error); // Log any errors
    process.exit(1); // Exit process with a failure code
  }
}
// Configure Passport.js
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



app.get('/login', (req, res) => {
  res.render('login', { isLoggedIn: req.isAuthenticated() });
});
app.get('/register', (req, res) => {
  res.render('register', { isLoggedIn: req.isAuthenticated() });
});

app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: false }));


app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});


// Define a route for the home page
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


// Define a route for retrieving all meals from the database
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

    if (meals) { // If meals are found
      res.render('meals', { meals: meals }); // Render the meals.ejs view and pass the meals to it
    } else {
      res.send("Something went wrong."); // Send an error message as the response
    }
  } catch (error) {
    console.log(error); // Log any errors
    res.status(500).send("Something went wrong.");
  }
});

app.get('/search', async (req, res) => {
  const query = req.query.q || '';
  const limit = 10;

  try {
    const meals = await Meal.find({ name: new RegExp(query, 'i') })
      .limit(limit)
      .exec();

    res.render('meals', { meals });
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

