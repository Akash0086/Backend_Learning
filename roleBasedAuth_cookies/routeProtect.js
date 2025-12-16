// role based route
import express from 'express';
import authorize from './middlewareAuthorize.js';

const router=express.Router();

router.get('/admin',authorize("admin"),(req,res)=>{
  res.json({ message: "Welcome Admin! You have access to top-secret admin data." });
});

router.get('/moderator',authorize(["admin","moderator"]),(req,res)=>{
  res.json({ message: "Welcome Admin or Moderator! You can manage content here." });
});

router.get("/profile", authorize(["admin", "moderator", "user"]), (req, res) => {
    res.json({
        message: `Welcome to your profile, ${req.session.user}!`,
        role: req.session.role
    });
});

export default router;
