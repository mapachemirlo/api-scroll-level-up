const express = require('express');
const userController = require('../controllers/userController');
const md_aut = require('../middleware/autenticateJWT');

const router = express.Router();

// Rutas locales
router.get('/test', md_aut.ensureAuth, userController.testHttp);




module.exports = router;