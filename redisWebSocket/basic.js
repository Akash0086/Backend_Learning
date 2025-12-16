// use redis/webscoket/csrf

import express from 'express';
import { createClient } from 'redis';
import { WebSocketServer, WebSocket } from 'ws';
import session from 'express-session';

import csrf from 'tiny-csrf';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { RedisStore } from 'connect-redis';

// Redis client setup (using IPv4 to avoid connection refused issues)
const redisClient = createClient({
  url: 'redis://127.0.0.1:6379'
});

const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

const wss = new WebSocketServer({ port: 8080 });
console.log('WebSocket server running on ws://localhost:8080');

(async () => {
  // Connect all clients
  await redisClient.connect();
  await pubClient.connect();
  await subClient.connect();

  // Set up message listener before subscribing
  subClient.on('message', (channel, message) => {
    console.log(`[${channel}] ${message}`);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ channel, message }));
      }
    });
  });

  // Subscribe (promise-based, no callback)
  try {
    await subClient.subscribe('notifications');
    console.log('Subscribed to notifications channel');
  } catch (err) {
    console.error('Failed to subscribe:', err);
  }

  // Now set up Express (after Redis is ready)
  const redisStoreInstance = new RedisStore({
    client: redisClient,
  });

  const app = express();
  app.use(bodyParser.json());
  app.use(cookieParser("your-cookie-secret"));

  app.use(session({
    store: redisStoreInstance,
    secret: "redisSecret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 600000
    }
  }));

  app.use(csrf(
    "123456789012iamasecret9876543210",  // Fixed: Now exactly 32 characters
    ["POST", "PUT", "PATCH", "DELETE"],
    []
  ));

  app.get("/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  app.post('/register', async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }
    req.session.username = username;
    console.log(`Saving user: ${username} to DB...`);

    await pubClient.publish('notifications', `New user registered: ${username}`);

    res.json({ message: 'User registered successfully' });
  });

  app.get('/', (req, res) => {
    res.json({ 
      message: 'Server is running. Try GET /csrf-token then POST /register with { "username": "test", "_csrf": "token" }',
      session: req.session.username ? `Logged in as ${req.session.username}` : 'No session'
    });
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await pubClient.quit();
    await subClient.quit();
    await redisClient.quit();
    wss.close(() => {
      console.log('WebSocket server closed');
      process.exit(0);
    });
  });
})();