const express = require('express');
const trackController = require('../controllers/trackController');
const md_auth = require('../middleware/autenticateJWT');
const router = express.Router();

router.get('/test', trackController.testHttp);

router.post('/register-track', md_auth.ensureAuth, trackController.createTrack);
router.post('/get-tracks', md_auth.ensureAuth, trackController.getTracks);
router.get('/get-track/:id?', md_auth.ensureAuth, trackController.getTrack);
router.put('/update-track/:id?', md_auth.ensureAuth, trackController.updateTrack);
router.delete('/delete-track/:id?', md_auth.ensureAuth, trackController.deletTrack);


module.exports = router;