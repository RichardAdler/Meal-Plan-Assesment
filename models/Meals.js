const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
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
}, { versionKey: false });

mealSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'recipe_id',
  justOne: false,
});

const Meal = mongoose.model('Meal', mealSchema);
module.exports = Meal;
