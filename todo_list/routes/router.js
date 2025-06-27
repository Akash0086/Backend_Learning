import fs from 'fs';
import path from 'path';

export const router=(req,res)=>{
  if(req.url==='/todo' && req.method==='POST'){
    let body='';

    req.on('data',(chunk)=>{
      body +=chunk.toString();
    });

    req.on('end',()=>{
      try{
        const data=JSON.parse(body);
        const {title,category} = data;

        if(!title || !category){
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Title and category are required' }));
        }

        const task = {
          id: `task-${Date.now()}`,
          title,
          category,
          status: 'pending',
          timestamp: new Date().toISOString()
        };
        const dataDir='data';
        const todopath=path.join(dataDir,'todos.json');
        
        let todos=[];

        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

        if(fs.existsSync(todopath)){
          const existing=fs.readFileSync(todopath,'utf-8');
          todos=JSON.parse(existing);
        }
        todos.push(task);
        fs.writeFileSync(todopath, JSON.stringify(todos, null, 2));

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task added', task }));
      }catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
   });
  }

  else if(req.url==='/todo' && req.method==='GET'){
    const dataDir='data';
    const todopath=path.join(dataDir,'todos.json');

    if (!fs.existsSync(todopath)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify([]));
    }
    const data=fs.readFileSync(todopath,'utf-8');
    const todos=JSON.parse(data);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(todos));
  }else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
};

