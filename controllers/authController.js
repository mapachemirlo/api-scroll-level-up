const authService = require('../services/authService');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');


dotenv.config();

const testControllerAuth = (req, res) => {
    res.status(200).json({ message: 'Controller OK'})
}

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerUser(name, email, password);
    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const githubCallback = (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log('Bearer token: ', token)
  res.redirect(`/?token=${token}`);
  //res.status(200).send(token)
};

module.exports = {
    testControllerAuth,
    register, 
    login, 
    githubCallback 
};
