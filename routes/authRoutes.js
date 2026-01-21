const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const { ensureGuest } = require('../middleware/authMiddleware');

router.get('/register', ensureGuest, authController.getRegister);

router.post('/register', ensureGuest, [
    body('username', 'Kullanıcı adı en az 3 karakter olmalıdır').trim().isLength({ min: 3 }),
    body('email', 'Geçerli bir e-posta adresi giriniz').isEmail().normalizeEmail(),
    body('password', 'Şifre en az 6 karakter olmalıdır').isLength({ min: 6 })
], authController.postRegister);

router.get('/login', ensureGuest, authController.getLogin);

router.post('/login', ensureGuest, [
    body('email', 'Geçerli bir e-posta giriniz').isEmail().normalizeEmail(),
    body('password', 'Şifre gereklidir').notEmpty()
], authController.postLogin);

router.get('/logout', authController.logout);

module.exports = router;