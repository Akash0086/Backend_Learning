import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFile = path.join(__dirname, 'data.json');

const app=express();
const PORT=3000;

app.use(express.json());

const logger=(req,res,next)=>{
  console.log(`${req.method}  ${req.url}  ${new Date().toISOString()}`);
  next();
};
app.use(logger);

const validateUser=(req,res,next)=>{
  const {name,email}=req.body;
  if(!name||!email||typeof name !='string'||!email.includes('@')){
    return res.status(400).json({error: 'Invalid name or email'});
  }
  next();
};

const readData=()=>{
  try{
    const data=fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(data);
  }catch(err){
    return { users:[]};
  }
};

const writeData=(data)=>{
  fs.writeFileSync(dataFile,JSON.stringify(data,null,2));
};

const router=express.Router();

router.get('/users',(req,res)=>{
  const {users}=readData();
  res.json(users)
});
//get user by finding their id
router.get('/users/:id',(req,res)=>{
  const {users}=readData();
  const user=users.findIndex(u=>u.id===parseInt(req.params.id));
  if(!user){
    return res.status(404).json({error:'User not found!'});
  }
  res.json(user);
});

router.post('/users',validateUser,(req,res)=>{
  const {users}=readData();
  const newUser={
    id:users.length?users[users.length-1].id+1:1,
    name:req.body.name,
    email:req.body.email
  };
  users.push(newUser);
  writeData({users});
  res.status(201).json(newUser);
});

router.put('/users/:id',validateUser,(req,res)=>{
  const {users}=readData();
  const userIndex=users.findIndex(u=>u.id===parseInt(req.params.id));
  if(userIndex===-1){
    return res.status(404).json({error:'User not found'});
  }
  users[userIndex]={
    ...users[userIndex],
    name:req.body.name,
    email:req.body.email,
  };

  writeData({users});
  res.json(users[userIndex]);
});

router.delete('/users/:id',(req,res)=>{
  const {users}=readData();
  const userIndex=users.findIndex(u=>u.id===parseInt(req.params.id));
  if(userIndex===-1){
    return res.status(400).json({error:'User not found'});
  }
  const deletedUser= users.splice(userIndex,1)[0];
  writeData({ users });
  res.json({deletedUser,message:'Successufully deleted'});
});
// Mount router
app.use('/api', router);

app.use((err,req,res,next)=>{
  console.error(err.stack);
  res.status(500).json({error:'Something went wrong'});
});

app.listen(PORT,()=>{
  console.log(`server running on http://localhost:${PORT}`);
})