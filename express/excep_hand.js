//url:divide?num1=10&num2=2 || num2=0

const express=require('express');
const app=express();

app.get('/divide',(req,res,next)=>{
  const num1=parseFloat(req.query.num1);
  const num2=parseFloat(req.query.num2);

  if (isNaN(num1)|| isNaN(num2)){
    const err=new Error("should be in interger")
    return next(err)
  }
  if(num2==0){
    const err=new Error("num2 should not be a zero")
    return next(err);
  }

  const result=num1/num2;

  res.json({message:`the value is ${result}`});
  
});

app.get("/user/:id", async (req, res, next) => {
  const userId = req.params.id;

  try {
    // Simulate async DB fetch
    if (userId === "0") {
      throw new Error("User not found");
    }

    res.json({ id: userId, name: "John Doe" });
  } catch (err) {
    return next(err);
  }
});

app.get('/crash',(req,res)=>{
  throw new Error('something went wrong');
});

app.use((err,req,res,next)=>{
  console.log("error:",err.message);
  res.status(500).json({
    status: "error",
    message: err.message,
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

