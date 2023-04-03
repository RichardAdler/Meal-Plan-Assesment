const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  steps: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    required: true,
  },
});

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
