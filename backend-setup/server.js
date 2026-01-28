require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('backend-setup');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

connectDB();

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: db ? 'Connected' : 'Disconnected'
  });
});

app.post('/save', async (req, res) => {
  try {
    const collection = db.collection('items');
    const result = await collection.insertOne({
      ...req.body,
      createdAt: new Date()
    });
    res.json({
      success: true,
      message: 'Data saved to database',
      id: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/data', async (req, res) => {
  try {
    const collection = db.collection('items');
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});