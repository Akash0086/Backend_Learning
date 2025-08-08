import http from 'http';
import { router } from './router.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  router(req, res);
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
