import { EventEmitter } from "events";
import fs from 'fs';
import path from 'path';

class Logger extends EventEmitter{};

const logger=new Logger();

logger.on('log',(message)=>{
  const logDir='logs';
  const logpath=path.join(logDir,'requests.log');

  if(!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
  }

  fs.appendFile(logpath,`[${new Date().toISOString()}]  ${message}\n`,(err)=>{
    if(err){
      console.error('Logged failed',err.message);
    }
  });

  console.log(`[${new Date().toISOString()}] ${message}`);

});


export const logEvent = (message) => {
  logger.emit('log', message);
};