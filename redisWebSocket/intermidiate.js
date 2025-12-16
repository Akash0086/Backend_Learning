// intermediate-chat.js
const express = require("express");
const redis = require("redis");
const WebSocket = require("ws");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csrf = require("tiny-csrf");

const redisClient = redis.createClient({ url: "redis://localhost:6379" });
redisClient.connect();
const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser("chat-secret"));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "chatSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 15 * 60 * 1000 }, // 15 min
  })
);

app.use(csrf("chat-csrf-secret-123456789", ["POST"], []));

app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Login route
app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  req.session.username = username;
  res.json({ message: "Login successful", username });
});

// Chat message route
app.post("/chat", async (req, res) => {
  if (!req.session.username)
    return res.status(401).json({ error: "Not logged in" });

  const { message } = req.body;
  const chatMsg = {
    user: req.session.username,
    text: message,
    time: new Date().toISOString(),
  };

  await pubClient.publish("chatroom", JSON.stringify(chatMsg));
  res.json({ success: true });
});

// WebSocket for real-time chat
const wss = new WebSocket.Server({ port: 8081 });
subClient.subscribe("chatroom");
subClient.on("message", (ch, msg) => {
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(msg);
    }
  });
});

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Chat server running → http://localhost:${PORT}`)
);
