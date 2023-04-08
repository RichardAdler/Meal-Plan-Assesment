const express = require('express');
const router = express.Router();
const Meal = require('../models/Meals');

// Get all meals
const getAllMeals = async (req, res) => {
    try {
        const meals = await Meal.find();
        res.render("meals", { meals });
    } catch (error) {
        console.log("Error retrieving meals:", error);
        res.send("Something went wrong.");
    }
};

router.post('/create-meal', async (req, res) => {
    const { name, steps, description, ingredients } = req.body;
    const id = await Meal.getNextId();
  
    const newMeal = new Meal({ name, id, steps, description, ingredients });
  
    try {
      await newMeal.save();
      res.redirect('/meals');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error creating meal');
    }
  });
  
module.exports = {
    getAllMeals,
    renderCreateMeal,
    router
};


