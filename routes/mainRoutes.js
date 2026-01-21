const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.get('/', mainController.getHome);
router.get('/about', mainController.getAbout);
router.get('/dashboard', ensureAuthenticated, mainController.getDashboard);

module.exports = router;