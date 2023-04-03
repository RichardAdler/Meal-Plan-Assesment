require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const { ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;

const dbName = 'Assessment';
const collectionName = 'interactions';
const dataFilePath = 'interactions.json';

async function seedInteractions() {
  let client;
  try {
    client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    console.log('Connected successfully to MongoDB');

    const db = client.db(dbName);
    const interactionsCollection = db.collection(collectionName);

    const data = await fs.promises.readFile(dataFilePath, 'utf8');
    const interactionsData = JSON.parse(data);

    let insertedCount = 0;

    for (const interaction of interactionsData) {
      interaction._id = new ObjectId(interaction._id.$oid); // Convert $oid field to ObjectId
      await interactionsCollection.insertOne(interaction);
      insertedCount++;
    }

    console.log(`Successfully inserted ${insertedCount} interactions into the database.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (client) {
      client.close();
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
  
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        window.open('/login', 'loginPopup', 'width=400,height=400');
      });
    }
  });
  
  
}

seedInteractions();