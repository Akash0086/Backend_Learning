import express from 'express';
import session from 'express-session';
import {google} from 'googleapis';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app=express();

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_fallback_secret', 
  resave:false,
  saveUninitialized:false,
  cookie:{secure:false}
}));

const oauth2Client=new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);
console.log('Client ID loaded:', process.env.GOOGLE_CLIENT_ID ? 'Yes' : 'NO - Fix .env!');
console.log('Full env check:', { clientId: !!process.env.GOOGLE_CLIENT_ID, secret: !!process.env.GOOGLE_CLIENT_SECRET });

const scopes=['profile','email'];

app.get('/',(req,res)=>{
  const state=crypto.randomBytes(32).toString('hex');
  req.session.state=state;

  const authUrl=oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope:scopes,
    //prompt: 'consent',  // Add this to always prompt for full permissions
    state
  });
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req,res)=>{
  try{
    if(req.query.state!=req.session.state){
      return res.status(400).send('state does not match-possible csrf attack');
    };

    const {code}=req.query;
    if (!code) {
      return res.status(400).send('No authorization code received.');
    };

    const {tokens}=await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Optional: Store tokens in session for later use
    req.session.tokens = tokens;

    res.send(`
      <h1>Authentication successful!</h1>
      <p>Access Token: ${tokens.access_token}</p>
      <p>Refresh Token: ${tokens.refresh_token || 'None (not granted)'}</p>
      <a href="/">Go back to home</a>
    `);
  }catch(err){
    console.error('OAuth error:',err);
    res.status(500).send(`Authentication failed: ${err.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));



