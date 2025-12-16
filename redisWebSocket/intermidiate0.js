// intermediate-redis.js

import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

// Redis client
const redisClient = createClient({
  url: 'redis://127.0.0.1:6379'
});

redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

// Redis session store
const redisStore = new RedisStore({
  client: redisClient,
});

// Middleware
app.use(bodyParser.json());
app.use(session({
  store: redisStore,
  secret: 'mySecretKey123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000, httpOnly: true }
}));

// Route to save a value in Redis
app.post('/set', async (req, res) => {
  const { key, value } = req.body;
  if (!key || !value) {
    return res.status(400).json({ error: 'Key and value are required' });
  }

  try {
    await redisClient.set(key, value);
    res.json({ message: `Saved ${key} = ${value}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save value' });
  }
});

// Route to get a value from Redis
app.get('/get/:key', async (req, res) => {
  const { key } = req.params;

  try {
    const value = await redisClient.get(key);
    if (!value) return res.status(404).json({ error: 'Key not found' });

    res.json({ key, value });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get value' });
  }
});

// Route to demonstrate session usage
app.get('/session', (req, res) => {
  if (!req.session.views) {
    req.session.views = 1;
  } else {
    req.session.views++;
  }
  res.json({ message: `You visited ${req.session.views} times` });
});

// Start server
app.listen(PORT, () => {
  console.log(`Express + Redis server running on http://localhost:${PORT}`);
});
