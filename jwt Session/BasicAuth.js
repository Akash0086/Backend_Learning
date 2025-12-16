//Basic Auth using session&Cookies
import express from 'express';
import session from 'express-session';
import fileStoreFact from 'session-file-store';

const filestore=fileStoreFact(session);

const app=express();

app.use(session({
  store:new filestore,
  name:"session-id",
  secret:"FUCKu",
  resave:false,
  saveUninitialized:false
}));

function auth(req,res,next){
  console.log(req.session);
  
  if(!req.session.user){
    const authHeader=req.headers.authorization;
    if(!authHeader){
      return res.status(401).json({ error: "You are not authenticated, please provide credentials" });
    }

    const auth=Buffer.from(authHeader.split(' ')[1],"base64").toString().split(":");
    const username=auth[0];
    const password=auth[1];

    // decode username/password from Basic Auth header
    if(username==="admin2" && password==="password"){
      req.session.user = username;
      return next();
    }
    else{
      return res.status(401).json({ error: "Invalid credentials" });
    }
  }
  else{
      if(req.session.user==="admin2"){
        return next();
      }else{
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }
  }

app.get("/api/login",auth,(req,res)=>{
  res.json({ message: "Successfully authenticated", user: req.session.user });
});

app.get("/api/protected", auth, (req, res) => {
  res.json({ message: "This is a protected resource", user: req.session.user });
});

app.get("/api/logout",auth,(req,res)=>{
  req.session.destroy((err)=>{
    if(err){
      return res.status(500).json({error:"Failed to logout"});
    }
    res.json({message:"Logged out successfully"});
  });
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(3000, () => {
    console.log("Server is Starting on http://localhost:3000");
});




