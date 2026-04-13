// const express = require('express');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const session = require('express-session');
// const path = require('path');
// const connectDB = require('./config/db');
// require('dotenv').config();

// const app = express();

// // ====================== MIDDLEWARE ======================
// // app.use(cors());
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));     // ← Forms ke liye zaroori
// app.use(cookieParser());

// connectDB();

// app.use(session({
//   secret: 'domania-admin-secret-2026',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { maxAge: 24 * 60 * 60 * 1000 }
// }));

// // ====================== EJS SETUP ======================
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// // ====================== ROUTES ======================
// app.use('/admin', require('./Routes/adminRoutes'));
// app.use('/api/public', require('./Routes/publicRoutes'));   // ← pehle wala public route

// // Root (optional)
// app.get('/', (req, res) => res.redirect('/admin/login'));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log(`👉 Admin Panel: http://localhost:${PORT}/admin/login`);
// });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// ====================== CORS - Strong Configuration ======================
app.use(cors({
   origin: [
    'https://domain-selling-eight.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));



// ====================== MIDDLEWARE ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ====================== SESSION SETUP (Most Important Fix) ======================
app.set("trust proxy", 1);

app.use(session({
  name: "domania.sid",
  secret: "super-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
  }),
  cookie: {
    httpOnly: true,
    secure: true,          // 🔥 HTTPS REQUIRED
    sameSite: "none",      // 🔥 CROSS DOMAIN REQUIRED
    maxAge: 1000 * 60 * 30,
  },
}));
// ====================== DATABASE ======================
connectDB();

// ====================== STATIC & VIEWS ======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ====================== ROUTES ======================
app.use('/admin', require('./Routes/adminRoutes'));
app.use('/api/public', require('./Routes/publicRoutes'));

app.get('/', (req, res) => res.redirect('/admin/login'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
