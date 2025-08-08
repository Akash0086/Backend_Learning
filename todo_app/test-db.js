import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    console.log('Connecting with:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD
    });

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD
    });

    console.log('✅ Connected to MySQL successfully!');
    await connection.end();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
}

testConnection();
