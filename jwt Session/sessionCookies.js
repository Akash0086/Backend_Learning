//session and cookies
import express from 'express';
import session from 'express-session'
import fileStoreClass from 'session-file-store'
import bodyParser from 'body-parser'

const fileStore = fileStoreClass(session);

const app=express();
app.use(bodyParser.json());

app.use(session({
   name:"session-id",
   secret:"MJai",
   store:new fileStore(),
   resave:false,
   saveUninitialized: false, 
       maxAge:3600000,
       httpOnly:true,
       sameSite:"lax"
    }
   ));

const users={admin:1234};

function auth(req,res,next){
    if(req.session.user){
       return next();
     }
     return res.status(401).json({error:"Unauthorized.please log in"});
};

app.post("/login",(req,res)=>{
   const {username,password} = req.body;
   if(users[username] && users[username]===password){
     req.session.user=username;
     return res.json({message:"Successfully login",user:username});
   }else{
      return res.status(401).json({error:"Invalid username or password"});
   }
});

app.get("/protectedRoute",auth,(req,res)=>{
   res.json({ message: "Welcome to the protected resource", user: req.session.user});
});

app.post("/logout",(req,res)=>{
   req.session.destroy(err=>{
      if(err){
         return res.status(500).json({error:"Internal server error occurred"});
       }
       res.clearCookie("session-id");
       res.json({message:"Successfully logout"});
       
    });
  });

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(3000,()=>{
  console.log("Server running at http://localhost:3000");
});
