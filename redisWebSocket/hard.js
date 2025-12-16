// hard-ecommerce.js
const express = require("express");
const redis = require("redis");
const WebSocket = require("ws");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const redisClient = redis.createClient({ url: "redis://localhost:6379" });
redisClient.connect();
const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser("ecom-secret"));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "ecommerceSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 30 * 60 * 1000 }, // 30 min
  })
);

// Login
app.post("/login", (req, res) => {
  const { username } = req.body;
  req.session.username = username;
  res.json({ message: "Logged in", username });
});

// Place Order
app.post("/order", async (req, res) => {
  if (!req.session.username)
    return res.status(401).json({ error: "Not logged in" });

  const orderId = Math.floor(Math.random() * 10000);
  const orderEvent = {
    user: req.session.username,
    orderId,
    status: "Placed",
  };

  await pubClient.publish("orders", JSON.stringify(orderEvent));
  res.json({ message: "Order placed", orderId });
});

// WebSocket → Order updates
const wss = new WebSocket.Server({ port: 8082 });
subClient.subscribe("orders");
subClient.on("message", (ch, msg) => {
  const event = JSON.parse(msg);
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(event));
    }
  });
});

app.listen(3002, () =>
  console.log("E-commerce server running → http://localhost:3002")
);
