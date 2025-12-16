import User from './schema.js';

async function seedDatabase(){
try{
  const users=[
    { username: 'admin', password: 'adminpassword', role: 'admin' },
    { username: 'moderator', password: 'modpassword', role: 'moderator' },
    { username: 'user', password: 'userpassword', role: 'user' }
  ];
  for(const userData of users){
    const userExist=await User.findOne({username:userData.username});
    if(!userExist){
      const newUser=new User(userData);
      await newUser.save();
      console.log(`User '${userData.username}' created.`);
    }
  }
}catch(error){
  console.error('Error seeding database:', error);
}
}

export default seedDatabase;