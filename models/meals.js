const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const MealSchema = new Schema({
    meal: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Meal', MealSchema);