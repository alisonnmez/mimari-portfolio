const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const connectDB = require('./config/db');

// 1. Load Environment Variables
dotenv.config();

// FIX: Define Critical Variables with Fallbacks
// If .env fails to load, these defaults will prevent the crash.
// We use 127.0.0.1 instead of localhost to avoid Node v18+ IPv6 issues.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db';
const SESSION_SECRET = process.env.SESSION_SECRET || 'my_super_secure_secret_fallback_key';
const PORT = process.env.PORT || 3000;

// Ensure config/db.js uses this URI even if .env was missing
process.env.MONGO_URI = MONGO_URI;

// 2. Connect to Database
connectDB();

const app = express();

// 3. Middleware Setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// 4. Session Configuration (UPDATED FOR STABILITY)
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGO_URI, // Explicitly passing the URI here fixes the "Assertion failed" error
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // Session TTL (1 day)
    }),
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

// 5. View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 6. Global Variables Middleware (Makes 'user' available in all EJS files)
app.use((req, res, next) => {
    res.locals.user = req.session.userId ? { 
        id: req.session.userId, 
        role: req.session.role, 
        username: req.session.username 
    } : null;
    next();
});

// 7. Routes
app.use('/', require('./routes/mainRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/projects', require('./routes/projectRoutes'));
app.use('/blog', require('./routes/blogRoutes'));

// 8. 404 Handler
app.use((req, res) => {
    res.status(404).render('404');
});

// 9. Start Server
app.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Database Target: ${MONGO_URI}`);
    console.log(`Access Link: http://localhost:${PORT}`);
    console.log(`-----------------------------------------------`);
});