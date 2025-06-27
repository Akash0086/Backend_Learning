const express = require('express');
const router = express.Router();

router.get('/home',(req,res)=>{
  res.send("this is home page");
});

module.exports=router;