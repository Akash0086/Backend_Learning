// basic-redis.js

import { createClient } from 'redis';

const redisClient = createClient({
  url: 'redis://127.0.0.1:6379'
});

// Connect to Redis
redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

// Set a value in Redis
async function setValue(key, value) {
  try {
    await redisClient.set(key, value);
    console.log(`Saved key "${key}" with value "${value}"`);
  } catch (err) {
    console.error('Error setting value:', err);
  }
}

// Get a value from Redis
async function getValue(key) {
  try {
    const value = await redisClient.get(key);
    console.log(`Value for key "${key}" is: ${value}`);
    return value;
  } catch (err) {
    console.error('Error getting value:', err);
  }
}

// Example usage
(async () => {
  await setValue('name', 'Alice');
  //await setValue('name', 'Akash');
  await getValue('name');

  // Close Redis connection
  await redisClient.quit();
})();
