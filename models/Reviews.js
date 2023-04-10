const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        ref:'User',
        required: true,
    },
    recipe_id: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
});

const Review = mongoose.model("Review", ReviewSchema, "interactions");
module.exports = Review;

