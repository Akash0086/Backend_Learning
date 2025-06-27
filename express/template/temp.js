const express = require('express');
const app=express();

app.set('view engine', 'ejs'); 


app.get('/:name',(req,res)=>{
  res.render('index',{user:req.params.name});
});

app.listen(3000, () => console.log('Server running on port 3000'));