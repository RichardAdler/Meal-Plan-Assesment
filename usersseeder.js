require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const { ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;

const dbName = 'Assessment';
const collectionName = 'users';
const dataFilePath = 'users.json';

async function seedUsers() {
  let client;
  try {
    client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    console.log('Connected successfully to MongoDB');

    const db = client.db(dbName);
    const usersCollection = db.collection(collectionName);

    const data = await fs.promises.readFile(dataFilePath, 'utf8');
    const usersData = JSON.parse(data);

    let insertedCount = 0;

    for (const user of usersData) {
      user._id = new ObjectId(user._id.$oid); // Convert $oid field to ObjectId
      await usersCollection.insertOne(user);
      insertedCount++;
    }

    console.log(`Successfully inserted ${insertedCount} users into the database.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (client) {
      client.close();
    }
  }
}

seedUsers();