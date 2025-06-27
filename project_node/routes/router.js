import fs from 'fs';
import path from 'path';

export const router=(req,res)=>{
  if((req.url==='/')&&(req.method==='GET')){
    res.writeHead(200,{'Content-Type':'text/plain'});
    res.end('Welcome to the Node.js Logging Server!')
  }else if((req.url==='/about')&&(req.method==='GET')){
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('This is a custom Node.js server without Express.');
  }else if((req.url==='/log')&&(req.method==='GET')){
    const logpath=path.join('logs','requests.log');
     fs.access(logpath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Log file not found');
      return;
    }

    const readStream = fs.createReadStream(logpath);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    readStream.pipe(res);
  })

  }else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
};