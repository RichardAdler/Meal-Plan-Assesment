// Import required modules
require('dotenv').config(); // Loads environment variables from .env file
const express = require ('express');
const app = express();// Create an instance of the Express application
const mongoose = require('mongoose');
const path = require("path");
const mealsController = require('./controllers/meals');
const Meal = require('./models/meals'); 
const PORT = process.env.PORT || 3000;
const morgan = require("morgan");


app.set("view engine", "ejs");
app.use(express.static(__dirname));

app.use(morgan('combined'));





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

// Define a route for the home page
app.get('/', async (req, res) => {
    try {
        const meals = await Meal.aggregate([
            { $match: { description: { $ne: null } } }, // Exclude meals with a null description
            { $sample: { size: 4 } } // Retrieve 4 random meals from the remaining documents
        ]);
        res.render("index", { meals: meals }); // Pass the meals to the index.ejs file
    } catch (error) {
        console.log(error); // Log any errors
        res.status(500).send("Something went wrong.");
    }
});


// Define a route for retrieving all meals from the database
app.get('/meals', async (req, res) => {
    const meal = await Meal.find().limit(10); // Add .limit(10) to limit the results

    if (meal) { // If meals are found
        res.render('meals', { meals: meal }); // Render the meals.ejs view and pass the meals to it
    } else {
        res.send("Something went wrong."); // Send an error message as the response
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
    app.listen(PORT, '0.0.0.0',() => {
        console.log(`Listening on the port: ${PORT}`); // Log the port the server is listening on
    })
});
