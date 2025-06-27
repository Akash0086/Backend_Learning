import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

const logDir='logs';
const logpath=path.join(logDir,'requests.log');

if(!fs.existsSync(logpath)) fs.mkdirSync(logpath);

class Logger extends EventEmitter{}
const logger=new Logger();

logger.on('log',(message)=>{
  fs.appendFile(logpath,`[${new Date().toISOString()}] ${message}\n`,(err)=>{
    if(err) throw err;
  });
});

export const logEvent=(message)=>{
  logger.emit('log',message);
};