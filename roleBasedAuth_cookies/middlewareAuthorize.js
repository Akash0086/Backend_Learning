
function authorize(roles=[]){
  if(typeof roles==='string'){
    roles=[roles];
  }
  return (req,res,next)=>{
    if(req.session.user && roles.includes(req.session.role)){
      next();
    }else{
      res.status(403).json({error:"Forbidden: You don't have permission to access this resource."})
    }
  };

  }

export default authorize;