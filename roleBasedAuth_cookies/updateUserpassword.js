import bcrypt from 'bcrypt';
import { connect } from 'mongoose';
import User from './schema.js';

const users = [
  { username: 'admin', password: 'adminpassword' },
  { username: 'moderator', password: 'modpassword' },
  { username: 'user', password: 'userpassword' },
];

async function updateAllPasswords() {
  try {
    await connect('mongodb://rbacUser:rbacPassword@localhost:27017/role-based-access', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    for (const u of users) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await User.updateOne(
        { username: u.username },
        { $set: { password: hashedPassword } }
      );
      console.log(`Password updated for ${u.username}`);
    }
  } catch (err) {
    console.error('Error updating passwords:', err);
  }
}

updateAllPasswords();
