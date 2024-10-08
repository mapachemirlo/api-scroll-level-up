//const authService = require('../services/authService');
const User = require('../models/User')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');


dotenv.config();

const testControllerAuth = (req, res) => {
    res.status(200).json({ message: 'Controller OK'})
}

const validateJWTAndFindOrCreateUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Validar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { user } = decoded;
    // Verificar si el usuario ya existe en la base de datos
    let existingUser = await User.findOne({ githubId: user.id });
    
    if (!existingUser) {
        existingUser = new User({
        githubId: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.image,
        isAdmin: false
      });
      await existingUser.save();
    }
    res.status(200).json({ message: 'User authenticated', user: existingUser });

  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
    testControllerAuth,
    validateJWTAndFindOrCreateUser,
    // register, 
    // login, 
    // githubCallback 
};






// const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const user = await authService.registerUser(name, email, password);
//     res.status(201).json({ user });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const { user, token } = await authService.loginUser(email, password);
//     res.status(200).json({ user, token });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// const githubCallback = (req, res) => {
//   const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   console.log('Bearer token: ', token)
//   res.redirect(`/?token=${token}`);
//   //res.status(200).send(token)
// };