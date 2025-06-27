const express=require('express');
const router=express.Router();

router.get('/login',(req,res)=>{
  res.send("<h1>This is the Login Page</h1><a href='/'>Back</a>");
});

module.exports = router;