const express=require('express')
const app=express();

const homepage=require("./router/home.js");
const loginpage=require("./router/login.js");

app.use("/",homepage);
app.use("/",loginpage);

app.listen(3000,()=> console.log("server is running"));