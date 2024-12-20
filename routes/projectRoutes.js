const express = require('express');
const projectController = require('../controllers/projectController');
const md_auth = require('../middleware/autenticateJWT');
const router = express.Router();

router.get('/test', projectController.testHttp);

router.post('/register-project', md_auth.ensureAuth, projectController.createProject);
router.post('/get-projects', md_auth.ensureAuth, projectController.getProjects);
router.get('/get-project/:id?', md_auth.ensureAuth, projectController.getProject);
//router.get('/get-projects-event/:id?', md_auth.ensureAuth, projectController.getProjectsInEvent);
router.put('/update-project/:id?', md_auth.ensureAuth, projectController.updateProject);
router.delete('/delete-project/:id?', md_auth.ensureAuth, projectController.deleteProject);

router.post('/upload-image-project/:id?', md_auth.ensureAuth, projectController.uploadImageProject);


module.exports = router;