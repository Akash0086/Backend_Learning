import express from 'express'
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

const app=express();
app.use(bodyParser.json());

const ACCESS_SECRET = 'access_secret_key';
const REFRESH_SECRET = 'refresh_secret_key';

let refreshTokens = []; 
const  users=[{id: 1, username: 'user1', password: 'password1' },
  {id: 1, username: 'user2', password: 'password2' }
]
app.post('/login',(req,res)=>{
  const {username,password}=req.body;

  const user=users.find(u=>u.username==username && u.password==password)

  if(!user) return res.status(401).send('Invalid credentials');

  const accessToken=jwt.sign({id:user.id,username:user.username},ACCESS_SECRET,{expiresIn:'15m'});
  const refreshToken=jwt.sign({id:user.username,username:user.username},REFRESH_SECRET);

  refreshTokens.push(refreshToken);

  res.json({accessToken,refreshToken});
});

app.post('/token',(req,res)=>{
  const {token} =req.body;
  
  if(!token || !refreshTokens.includes(token)) return res.sendStatus(401);

  jwt.verify(token,REFRESH_SECRET,(err,user)=>{
    if(err) return res.sendStatus(403);

    const accessToken=jwt.sign({id:user.id,username:user.username},ACCESS_SECRET,{expiresIn:'15m'});
    res.json({accessToken});
  });
});

  function authenticateToken(req,res,next){
    const authHeader=req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1];

    if(!token) return res.sendStatus(403);

     jwt.verify(token, ACCESS_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }

  app.get('/secure-data',authenticateToken,(req,res)=>{
    res.json({ message: 'Secure data accessed', user: req.user });
  });

app.listen(3000, () => console.log('Server running on port 3000'));

