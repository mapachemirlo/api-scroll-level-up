const express = require('express');
const userController = require('../controllers/userController');
const md_auth = require('../middleware/autenticateJWT');

const router = express.Router();

router.get('/test', md_auth.ensureAuth, userController.testHttp);
router.get('/get-users', md_auth.ensureAuth, userController.getusers);
router.get('/get-user/:id?', md_auth.ensureAuth, userController.getUser);
router.put('/update-user/:id?', md_auth.ensureAuth, userController.updateUser);
router.delete('/delete-user/:id?', md_auth.ensureAuth, userController.deleteUser);


module.exports = router;