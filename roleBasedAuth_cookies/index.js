import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('./roleBasedAuth_cookies/.env') });

console.log('MONGO_URI:', process.env.MONGO_URI);

import seedDatabase from './dbDataSeeding.js';
import authRoutes from './routeAuth.js';
import protectRoutes from './routeProtect.js';

const app = express();

app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'a-default-fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
      sameSite: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

app.use(authRoutes);
app.use(protectRoutes);

app.get('/', (req, res) => {
  res.json({
    message:
      'Welcome to the Role-Based Access Control API. Please log in to access protected routes.',
  });
});

const startServer = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Successfully connected to MongoDB.');
    await seedDatabase(); // Optional: seed initial data

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1); // Exit process if DB connection fails
  }
};

startServer();
