const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getRegister = (req, res) => {
    res.render('auth/register', { title: 'Kayıt Ol', errors: [], formData: {} });
};

exports.postRegister = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('auth/register', {
            title: 'Kayıt Ol',
            errors: errors.array(),
            formData: req.body
        });
    }

    try {
        const { username, email, password } = req.body;
        
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.render('auth/register', {
                title: 'Kayıt Ol',
                errors: [{ msg: 'Bu e-posta veya kullanıcı adı zaten kullanımda.' }],
                formData: req.body
            });
        }

        user = new User({ username, email, password });
        await user.save();

        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};

exports.getLogin = (req, res) => {
    res.render('auth/login', { title: 'Giriş Yap', errors: [], formData: {} });
};

exports.postLogin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('auth/login', {
            title: 'Giriş Yap',
            errors: errors.array(),
            formData: req.body
        });
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.render('auth/login', {
                title: 'Giriş Yap',
                errors: [{ msg: 'Geçersiz e-posta veya şifre.' }],
                formData: req.body
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('auth/login', {
                title: 'Giriş Yap',
                errors: [{ msg: 'Geçersiz e-posta veya şifre.' }],
                formData: req.body
            });
        }

        // Set Session
        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.username = user.username;

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).render('500');
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error(err);
        res.redirect('/');
    });
};