const express=require('express');
const app=express();
const PORT=3000;

app.use(express.json());

app.post('/',(req,res)=>{
  const {name}=req.body;

  if(!name){
    return res.status(400).send('Name is required')
  }
  res.send(`Welcome ${name}!`);

});

app.listen(PORT,()=>{
console.log(`server is runnning on http://localhost:${PORT}`)
});