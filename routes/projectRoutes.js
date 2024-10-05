const express = require('express');
const projectController = require('../controllers/projectController');
const md_auth = require('../middleware/autenticateJWT');
const router = express.Router();

router.get('/test', projectController.testHttp);

router.post('/register-project', md_auth.ensureAuth, projectController.createProject);
router.get('/get-projects', md_auth.ensureAuth, projectController.getProjects);
router.get('/get-project/:id?', md_auth.ensureAuth, projectController.getProject);



module.exports = router;