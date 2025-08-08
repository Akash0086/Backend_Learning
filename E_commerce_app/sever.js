import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/products.js';

dotenv.config();

const app = express();
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the E-Commerce API');
});

// Product routes
app.use('/api', productRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
