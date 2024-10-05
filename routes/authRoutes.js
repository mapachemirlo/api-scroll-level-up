//const passport = require('passport');
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/test', authController.testControllerAuth);

router.get('/github', authController.validateJWTAndFindOrCreateUser);


// // GitHub Auth for OAuth App github
// router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
// router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), authController.githubCallback);

module.exports = router;
