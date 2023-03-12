// Import required modules
require('dotenv').config(); // Loads environment variables from .env file
const express = require ('express');
const app = express();// Create an instance of the Express application
const mongoose = require('mongoose');
const path = require("path");
const Meal = require('./models/meals');



app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));




// Set the port to use
const PORT = process.env.PORT || 3000;

// Configure Mongoose to use some specific options
mongoose.set('strictQuery', false);

// Create a function to connect to MongoDB and handle any errors
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI); // Connect to MongoDB
        console.log(`MongoDB Connected on: ${conn.connection.host}`); // Log connection host
    } catch (error) {
        console.log(error); // Log any errors
        process.exit(1); // Exit process with a failure code
    }
}

// Define a route for the home page
app.get('/', (req, res) => {
    res.send("index"); 
});

// Define a route for adding a new meal
app.get('/add-meal', async (req, res) => {
    try {
        await Meal.insertMany([
            {   
                meal: "Chili",
                body: "recipe for Chili...",
            },
            {    
                meal: "Beef",
                body: "recipe for Beef...",
            }
        ]); // Insert new meals into the database
        res.send('Meal Added...') // Send a success message as the response
    } catch (error) {
        console.log("err", + error); // Log any errors
    }
});

// Define a route for retrieving all meals from the database
app.get('/meals', async (req, res) => {
    const meal = await Meal.find(); // Retrieve all meals from the database

    if (meal) { // If meals are found
        res.json(meal) // Send the meals as a JSON response
    } else {
        res.send("Something went wrong."); // Send an error message as the response
    }
});

// Connect to MongoDB and start the server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening on the port: ${PORT}`); // Log the port the server is listening on
    })
});
