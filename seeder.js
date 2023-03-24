require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const uri = process.env.MONGODB_URI;

async function seedData() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const jsonData = JSON.parse(fs.readFileSync('recipes.json', 'utf-8'));

    await client.connect();
    const database = client.db('Assessment');
    const collection = database.collection('Meals');

    const recipesArray = Object.values(jsonData);
    const result = await collection.insertMany(recipesArray);
    console.log(`${result.insertedCount} documents were inserted into the collection.`);

  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    await client.close();
  }
}

seedData();
