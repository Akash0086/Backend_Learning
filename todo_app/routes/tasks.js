import express from 'express';
import {db} from '../db/index.js';

const router=express.Router();

router.get('/',async(req,res)=>{
  const [tasks]=await db.execute('select * from tasks');
  res.json(tasks);
});

router.post('/',async(req,res)=>{
  const {title,category_id}=req.body;
  await db.execute(
    'insert into tasks (title,category_id) value (?,?)',[title,category_id]
  );
  res.status(201).json({message:'Task added'});
});

router.put('/:id',async(req,res)=>{
  const {status}=req.body;
  const {id}=req.params;
  await db.execute('update tasks set status=? where id=?',[status,id]);
  res.json({message:'Task updated'});
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
  res.json({ message: 'Task deleted' });
});

export default router;