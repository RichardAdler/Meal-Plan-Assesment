require('dotenv').config();
const express = require ('express');
const mongoose = require('mongoose');
const Meal = require('./models/meals');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', false);
const connectDB = async()=> {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected on: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}


app.get('/', (req, res) => {
    res.send({title: 'Meal'});
});

app.get('/add-note', async (req, res) => {
    try {
        await Meal.insertMany([
        {   
            meal:"Chili",
            body: "recipe for Chili...",
        },
        {    
            meal:"Beef",
            body: "recipe for Beef...",
        }
        ]);
    } catch (error) {
        console.log("err", + error);
    }
});


app.get('/meals', async (req, res) => {
    const meal = await Meal.find();

    if(meal){
        res.json(meal)
    }else{
        res.send("Something went wrong.");
    }
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening on the port: ${PORT}`);
    })
});


