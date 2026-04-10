const express = require('express');
const router = express.Router();
const publicController = require('../controller/publicController');

router.get('/captcha', publicController.getCaptcha);

router.get('/domains', publicController.getAllDomains);
router.post('/track-visit', publicController.trackVisit);       
router.post('/inquiries', publicController.createInquiry);

module.exports = router;