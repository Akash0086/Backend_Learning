// utils/logger.js
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

class Logger extends EventEmitter {}

const logger = new Logger();

logger.on('log', (message) => {
  const logDir = 'logs';
  const logPath = path.join(logDir, 'requests.log');

  // ✅ Ensure folder exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  fs.appendFile(logPath, `[${new Date().toISOString()}] ${message}\n`, (err) => {
    if (err) throw err;
  });
});

export const logEvent = (message) => {
  logger.emit('log', message);
};
