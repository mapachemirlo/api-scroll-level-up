const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

// Rutas locales
router.get('/test', authController.testControllerAuth);
router.post('/register', authController.register);
router.post('/login', authController.login);

// GitHub Auth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), authController.githubCallback);

module.exports = router;
