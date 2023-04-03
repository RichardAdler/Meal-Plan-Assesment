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

  
module.exports = {
    getAllMeals
};
