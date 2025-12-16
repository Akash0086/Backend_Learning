// server-session-csrf.js
import express from 'express';
import session from 'express-session';
import crypto from 'crypto';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'replace-with-secure-random-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false /* set true on HTTPS */, sameSite: 'lax' } 
}));

// Middleware to ensure a CSRF token exists in the session
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken; // for templates
  next();
});

// Serve a simple form with token embedded
app.get('/form', (req, res) => {
  res.send(`
    <form method="POST" action="/submit">
      <input name="name" />
      <input type="hidden" name="csrfToken" value="${res.locals.csrfToken}" />
      <button>Submit</button>
    </form>
  `);
});

// Verify token on POST
app.post('/submit', (req, res) => {
  const tokenFromBody = req.body.csrfToken;
  if (!tokenFromBody || tokenFromBody !== req.session.csrfToken) {
    return res.status(403).send('CSRF validation failed');
  }
  // Accept the request
  res.send('OK - CSRF token valid');
});

app.listen(3000);
