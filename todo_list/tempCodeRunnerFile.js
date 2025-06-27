import http from 'http';
import {logEvent} from './utils/logger.js';
import {router} from './routes/router.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT=process.env.PORT||3000;

const server=http.createServer((req,res)=>{
  logEvent(`$(req.method) $(req.url)`);
  router(req,res);
});

server.listen(PORT,()=>{
  console.log(`server is running on ${PORT}`);
});