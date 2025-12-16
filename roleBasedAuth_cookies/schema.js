import mongoose from "mongoose";
import bcrypt from "bcrypt";
const saltRound=10;

const userSchema=new mongoose.Schema({
  username:{
    type:String,
    require:true,
    trim:true
  },
  password:{
    type:String,
    required:true
  },
  role:{
    type:String,
    enum:['admin','moderator','user']
  }
});

// Hash password before saving a new user
userSchema.pre('save',async function(next){
  if(this.isModified('password')){
    this.password=await bcrypt.hash(this.password,saltRound);
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;