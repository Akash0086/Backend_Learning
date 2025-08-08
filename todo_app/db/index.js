import dotenv from 'dotenv';
import path from 'path';

// ✅ Force load the exact path to .env
dotenv.config({ path: path.resolve('./todo_app/.env') });

import mysql from 'mysql2/promise';

// Debug environment variables BEFORE connecting
console.log('Connecting to MySQL with:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME_NEW,
  password: process.env.DB_PASSWORD // You can hide this in production
});

export const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME_NEW,
  password: process.env.DB_PASSWORD
});
