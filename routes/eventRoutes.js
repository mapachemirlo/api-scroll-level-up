const express = require('express');
const eventController = require('../controllers/eventController');
const md_auth = require('../middleware/autenticateJWT');
const router = express.Router();

router.get('/test', eventController.testHttp);

router.post('/register-event', md_auth.ensureAuth, eventController.createEvent);
router.get('/get-events', eventController.getEvents);
router.get('/get-event/:id?', md_auth.ensureAuth, eventController.getEvent);
router.put('/update-event/:id?', md_auth.ensureAuth, eventController.updateEvent);
router.delete('/delete-event/:id?', md_auth.ensureAuth, eventController.deleteEvent);



module.exports = router;