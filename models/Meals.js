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



mealSchema.pre('save', async function (next) {
  // Only generate an id if it is not already present
  if (!this.id) {
    // Find the maximum id value in the collection
    const maxId = await this.constructor.findOne().sort('-id').limit(1).exec();

    // If there are no documents in the collection, start with id 1
    // Otherwise, increment the maximum id value by 1
    this.id = maxId ? maxId.id + 1 : 1;
  }
  next();
});

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
