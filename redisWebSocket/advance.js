const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const redis = require("redis");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const redisClient = redis.createClient({ url: "redis://localhost:6379" });
redisClient.connect();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser("multi-secret"));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "multiServerSecret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 20 * 60 * 1000 },
  })
);

// Auth service (could be in another container)
app.post("/login", (req, res) => {
  const { username } = req.body;
  req.session.username = username;
  res.json({ message: "Welcome " + username });
});

app.get("/", (req, res) => {
  res.json({ session: req.session.username || "Guest" });
});

app.listen(4000, () => console.log("Gateway running → http://localhost:4000"));
