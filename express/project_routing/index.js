const express=require('express');
const path=require('path');
const app=express();

const homepage=require('./router/home.js');
const loginpage=require('./router/login.js');

app.use(express.static(path.join(__dirname,'public')));

app.use('/',homepage);
app.use('/',loginpage);


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});