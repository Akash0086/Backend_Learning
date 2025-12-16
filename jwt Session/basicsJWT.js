import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

const app=express();

app.use(bodyParser.json());

const SECRET_KEY='jwtSecretKey';

// In a real app, this would be a database
const users=[
  {id: 1, username: 'user1', password: 'password1'},
  {id: 2, username: 'user2', password: 'password2'}
];

app.post('/login',(req,res)=>{
  const {username,password}=req.body;

  const user=users.find(u=>u.username===username && u.password===password);

  if(!user){
    return res.status(401).json({message:'Invalid username or password'});
  }

  const token=jwt.sign({id:user.id,username:user.username},SECRET_KEY,{expiresIn:'1h'});
  res.json(token);
});

function authenticateToken(req,res,next){
  const authHeader = req.headers['authorization'];
  const token=authHeader && authHeader.split(' ')[1];

  if(!token) return res.sendStatus(401);

  jwt.verify(token,SECRET_KEY,(err,user)=>{
    if(err) return res.sendStatus(401);
    req.user=user;
    next();
  });
};

app.get('/profile',authenticateToken,(req,res)=>{
  res.json({ message: 'This is a protected profile route', user: req.user });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});