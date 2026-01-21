const ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    // Redirect to login if not authenticated
    res.redirect('/auth/login');
};

const ensureGuest = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    return next();
};

const ensureAdmin = (req, res, next) => {
    if (req.session && req.session.role === 'admin') {
        return next();
    }
    // Render 403 Forbidden page for non-admins
    res.status(403).render('403');
};

module.exports = {
    ensureAuthenticated,
    ensureGuest,
    ensureAdmin
};