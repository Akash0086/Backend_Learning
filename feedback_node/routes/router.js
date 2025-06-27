import fs from 'fs';
import path from 'path';
import { logEvent } from '../utils/logger.js';

export const router = (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to the Node.js Logging Server!');
  }

  else if (req.url === '/about' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('This is a custom Node.js server without Express.');
  }

  else if (req.url === '/log' && req.method === 'GET') {
    const logpath = path.join('log', 'requests.log');

    fs.access(logpath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Log file not found');
        return;
      }

      const readStream = fs.createReadStream(logpath);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      readStream.pipe(res);
    });
  }

  else if (req.url === '/feedback' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        if (!data.name || !data.message || data.name.trim() === '' || data.message.trim() === '') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Name and message are required' }));
        }

        const feedbackEntry = {
          name: data.name,
          message: data.message,
          timestamp: new Date().toISOString()
        };

        const dataDir = 'data';
        const feedbackpath = path.join(dataDir, 'feedback.json');

        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir);
        }

        let feedbackList = [];
        if (fs.existsSync(feedbackpath)) {
          const existing = fs.readFileSync(feedbackpath, 'utf-8');
          feedbackList = JSON.parse(existing);
        }

        feedbackList.push(feedbackEntry);
        fs.writeFileSync(feedbackpath, JSON.stringify(feedbackList, null, 2));

        logEvent(`POST /feedback - ${data.name}: "${data.message}"`);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Feedback saved', feedback: feedbackEntry }));

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  else if (req.url === '/feedback' && req.method === 'GET') {
    const feedbackPath = path.join('data', 'feedback.json');

    fs.access(feedbackPath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify([]));
      }

      const feedbackData = fs.readFileSync(feedbackPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(feedbackData);
    });
  }

  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
};
