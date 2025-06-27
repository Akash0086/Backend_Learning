import http from 'http';
import dotenv from 'dotenv';
import  {logEvent} from './utils/logger.js';
import {router} from './routes/router.js';
dotenv.config();

const PORT=process.env.PORT || 3000;

const server=http.createServer((req,res)=>{
  logEvent(`${req.url} ${req.method}`);
  router(req,res);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});