const express=require('express');
const router=express.Router();

router.get('/home',(req,res)=>{
  res.send("<h1>This is the Home Page</h1><a href='/'>Back</a>");
});

module.exports = router;