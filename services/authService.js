const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const registerUser = async (name, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();
  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { user, token };
};

module.exports = { registerUser, loginUser };
