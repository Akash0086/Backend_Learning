import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import csurf from 'csurf';
import bodyParser from 'body-parser';

const app = express();
app.use(cookieParser());
app.use(session({ secret: 'secret', resave:false, saveUninitialized:false }));
app.use(bodyParser.urlencoded({ extended: false }));

// attach csurf middleware (stores token in session)
app.use(csurf({ cookie: false })); // default uses session

app.get('/form', (req, res) => {
  // req.csrfToken() returns the token to embed
  res.send(`<form method="POST" action="/submit">
    <input name="name" />
    <input type="hidden" name="_csrf" value="${req.csrfToken()}" />
    <button>Submit</button>
  </form>`);
});

app.post('/submit', (req, res) => {
  res.send('ok');
});
