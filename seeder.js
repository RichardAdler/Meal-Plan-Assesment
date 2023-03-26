
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const { ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;

const dbName = 'Assessment';
const collectionName = 'meals';
const dataFilePath = 'meals.json';

async function seedMeals() {
  let client;
  try {
    client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    console.log('Connected successfully to MongoDB');

    const db = client.db(dbName);
    const mealsCollection = db.collection(collectionName);

    const data = await fs.promises.readFile(dataFilePath, 'utf8');
    const mealsData = JSON.parse(data);

    let insertedCount = 0;

    for (const meal of mealsData) {
      meal._id = new ObjectId(meal._id.$oid); // Convert $oid field to ObjectId
      await mealsCollection.insertOne(meal);
      insertedCount++;
    }

    console.log(`Successfully inserted ${insertedCount} meals into the database.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (client) {
      client.close();
    }
  }
}

seedMeals();