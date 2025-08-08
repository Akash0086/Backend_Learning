import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const dataDir = join(process.cwd(), 'data');
const todoPath = join(dataDir, 'todos.json');

export const router = (req, res) => {
  if (req.url === '/todo' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { title, category } = data;

        if (!title || !category) {
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

        let todos = [];

        // Ensure data directory exists
        if (!existsSync(dataDir)) {
          mkdirSync(dataDir, { recursive: true });
        }

        // Read existing todos
        if (existsSync(todoPath)) {
          const existing = readFileSync(todoPath, 'utf-8');
          todos = JSON.parse(existing);
        }

        // Add new task
        todos.push(task);
        writeFileSync(todoPath, JSON.stringify(todos, null, 2), 'utf-8');

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task added', task }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  else if (req.url.startsWith('/todo') && req.method === 'GET') {
    try {
      const host = req.headers.host || 'localhost:3000';
      const url = new URL(req.url, `http://${host}`);
      const page = parseInt(url.searchParams.get('page')) || 1;
      const limit = parseInt(url.searchParams.get('limit')) || 5;
      const statusFilter = url.searchParams.get('status')?.trim().toLowerCase();
      const categoryFilter = url.searchParams.get('category')?.trim().toLowerCase();
      const searchQuery = url.searchParams.get('search')?.trim().toLowerCase();

      let todos = [];

      if (existsSync(todoPath)) {
        const data = readFileSync(todoPath, 'utf-8');
        todos = JSON.parse(data);
      }

      // Apply filters
      if (statusFilter) {
        todos = todos.filter(todo => todo.status?.toLowerCase() === statusFilter);
      }

      if (categoryFilter) {
        todos = todos.filter(todo => todo.category?.toLowerCase() === categoryFilter);
      }

      if (searchQuery) {
        todos = todos.filter(todo =>
          todo.title?.toLowerCase().includes(searchQuery)
        );
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTodos = todos.slice(startIndex, endIndex);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        page,
        limit,
        total: todos.length,
        data: paginatedTodos
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }

  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
};
