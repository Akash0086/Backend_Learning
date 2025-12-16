import express from 'express';
import bcrypt from 'bcrypt';
import User from './schema.js';
import { connect } from 'mongoose';

const router = express.Router();

router.post('/login',async (req,res)=>{
  const {username,password}=req.body;

  if(!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

  try{
     const user=await User.findOne({username});

     if(!user){
      return res.status(401).json({error:"User can't found"});
     }
     const isMatch=await bcrypt.compare(password,user.password);
     console.log('Password match:', isMatch);
     
     if(isMatch){
      req.session.user=user.username;
      req.session.role=user.role;
      return res.json({ message: "Logged in successfully", role: user.role });
     }else{
      return res.status(401).json({error:"Invalid credentials"});
     }
  }catch(error){
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/logout',(req,res)=>{
  req.session.destroy((err)=>{
    if(err){
      return res.status(500).json({ error: "Could not log out." });
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
