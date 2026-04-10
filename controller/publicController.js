// // controllers/publicController.js
// const Domain = require('../models/Domain');
// const Inquiry = require('../models/Inquiry');
// const Visit = require('../models/Visit');
// const nodemailer = require('nodemailer');
// require('dotenv').config();

// // ================== Nodemailer Transporter (CORRECTED) ==================
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS

//   }
// });

// // Get all domains for landing page
// exports.getAllDomains = async (req, res) => {
//   try {
//     const domains = await Domain.find().sort({ createdAt: -1 });
//     res.json(domains);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // Track visitor with cookie (first time only)
// exports.trackVisit = async (req, res) => {
//   try {
//     if (req.cookies.visited) {
//       return res.json({ message: 'Already counted', count: null });
//     }

//     let visitDoc = await Visit.findOne();
//     if (!visitDoc) {
//       visitDoc = await Visit.create({ count: 0 });
//     }

//     visitDoc.count += 1;
//     await visitDoc.save();

//     // Set cookie for 24 hours
//     res.cookie('visited', 'true', {
//       maxAge: 24 * 60 * 60 * 1000,
//       httpOnly: true
//     });

//     res.json({ message: 'Visit counted', count: visitDoc.count });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // Submit inquiry
// exports.createInquiry = async (req, res) => {
//   try {
//     const { name, email, phone, message, interestedDomain, num1, num2, answer } = req.body;

//     // Captcha check
//     if (!answer || parseInt(answer) !== num1 + num2) {
//       return res.status(400).json({ error: 'Wrong Captcha' });
//     }

//     const inquiry = await Inquiry.create({
//       name,
//       email,
//       phone: phone || '',
//       message,
//       interestedDomain: interestedDomain || 'www.domania.com'
//     });

//     // Send email to admin
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: process.env.ADMIN_EMAIL,
//       subject: `New Inquiry - ${interestedDomain || 'Domain'}`,
//       html: `
//         <h2>New Domain Inquiry Received</h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
//         <p><strong>Interested Domain:</strong> ${interestedDomain}</p>
//         <p><strong>Message:</strong></p>
//         <p>${message}</p>
//         <hr>
//         <small>Inquiry ID: ${inquiry._id} | Date: ${new Date().toLocaleString()}</small>
//       `
//     });

//     res.json({ success: true, message: 'Inquiry saved & Send mail' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


// controllers/publicController.js
const Domain = require('../models/Domain');
const Inquiry = require('../models/Inquiry');
const { VisitCount, Visitor } = require('../models/Visit');
const nodemailer = require('nodemailer');
require('dotenv').config();


// ================== Nodemailer Transporter ==================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Extra settings for better reliability
  tls: {
    rejectUnauthorized: false
  }
});

// Get all domains for landing page
exports.getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.find().sort({ createdAt: -1 });
    res.json(domains);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.trackVisit = async (req, res) => {
  try {
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                  req.socket?.remoteAddress || req.ip || '';
    const ip = rawIp === '::1' ? '127.0.0.1' : rawIp;

    const today = new Date().toISOString().slice(0, 10);
    const userAgent = req.headers['user-agent'] || '';
    const device = /Mobi|Android|iPhone|iPad|iPod/.test(userAgent) ? 'Mobile' : 'Desktop';

    // Frontend se click ka type bhej rahe hain
    const clickType = req.body?.clickType || 'general-click';
    const page = req.body?.page || req.originalUrl || '/';

    // Visitor record update (clicks badhao)
    await Visitor.findOneAndUpdate(
      { ip, date: today },
      {
        $setOnInsert: { ip, date: today, userAgent, device },
        $inc: { clicks: 1 },
        $set: { lastSeen: new Date() },
        $addToSet: { pages: page }
      },
      { upsert: true }
    );

    // GLOBAL COUNT - Sirf click pe badhega
    const vc = await VisitCount.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      totalVisits: vc.count,
      message: `Click tracked: ${clickType}`
    });

  } catch (err) {
    console.error('TrackVisit Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


// Generate Captcha
// controllers/publicController.js

// ================== GET CAPTCHA ==================
// exports.getCaptcha = async (req, res) => {
//   try {
//     const num1 = Math.floor(Math.random() * 10) + 1; // 1–10
//     const num2 = Math.floor(Math.random() * 10) + 1;
//     const captchaSum = num1 + num2;

//     // 🔥 IMPORTANT: Store sum in session
//     req.session.captcha = captchaSum;

//     res.json({
//       num1,
//       num2,
//       // (optional) frontend ke liye bhej sakte ho
//       // sum: captchaSum
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // ================== CREATE INQUIRY ==================
// exports.createInquiry = async (req, res) => {
//   try {
//     const { name, email, message, answer } = req.body;

//     // ✅ CAPTCHA CHECK (SESSION BASED)
//     if (!answer || parseInt(answer) !== req.session?.captcha) {
//       return res.status(400).json({ error: 'Wrong Captcha' });
//     }

//     // Save inquiry
//     const inquiry = await Inquiry.create({
//       name,
//       email,
//       message,
//     });

//     // Get visitor info (optional)
//     const visitor = await Visitor.findOne({ cookieId: req.cookies?.cookieId });

//     console.log(`📧 Sending email for inquiry: ${inquiry._id}`);

//     // ================== SEND MAIL ==================
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: process.env.ADMIN_EMAIL,
//       subject: `New Inquiry`,
//       html: `
//         <h2>New Inquiry Received</h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Message:</strong></p>
//         <p>${message}</p>

//         <hr>
//         <h3>Visitor Info</h3>
//         <p><strong>IP:</strong> ${visitor?.ip || 'N/A'}</p>
//         <p><strong>Device:</strong> ${visitor?.device || 'N/A'}</p>

//         <hr>
//         <small>Inquiry ID: ${inquiry._id} | Date: ${new Date().toLocaleString()}</small>
//       `
//     });

//     // Clear captcha after successful use
//     req.session.captcha = null;

//     res.json({ success: true, message: 'Inquiry sent successfully!' });

//   } catch (err) {
//     console.error("❌ Error in createInquiry:", err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


// ================== GET CAPTCHA ==================
exports.getCaptcha = async (req, res) => {
  try {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const captchaSum = num1 + num2;

    // Strong Session Setup
    req.session.captcha = captchaSum;
    req.session.captchaGeneratedAt = Date.now();

    console.log(`🔢 New Captcha Generated → ${num1} + ${num2} = ${captchaSum} | Session ID: ${req.sessionID}`);

    res.json({
      num1,
      num2
    });
  } catch (err) {
    console.error("Get Captcha Error:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ================== CREATE INQUIRY ==================
exports.createInquiry = async (req, res) => {
  try {
    const { name, email, phone = '', message, subject, interestedDomain = 'General', answer } = req.body;

    console.log("📥 Inquiry Received:");
    console.log("   Body:", req.body);
    console.log("   Session Captcha:", req.session?.captcha);
    console.log("   User Answer:", answer);

    // Captcha Validation with Logs
    if (!answer) {
      console.log("❌ No answer provided");
      return res.status(400).json({ error: 'Please enter captcha answer' });
    }

    if (!req.session?.captcha) {
      console.log("❌ No captcha in session");
      return res.status(400).json({ error: 'Captcha expired. Please refresh' });
    }

    const userAnswer = parseInt(answer);
    const correctAnswer = req.session.captcha;

    console.log(`🔍 Comparing → User: ${userAnswer} | Correct: ${correctAnswer}`);

    if (userAnswer !== correctAnswer) {
      console.log("❌ Wrong Captcha");
      return res.status(400).json({ error: 'Wrong Captcha' });
    }

    // ✅ Captcha Correct → Create Inquiry
    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      message: message || subject,   // subject ko message mein merge kar rahe ho
      interestedDomain
    });

    console.log(`✅ Inquiry Created Successfully! ID: ${inquiry._id}`);

    // Send Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Inquiry from ${name}`,
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong> ${message || subject}</p>
        <hr>
        <small>Inquiry ID: ${inquiry._id} | Date: ${new Date().toLocaleString()}</small>
      `
    });

    // Clear captcha after success
    req.session.captcha = null;
    req.session.captchaGeneratedAt = null;

    res.json({ success: true, message: 'Inquiry sent successfully!' });

  } catch (err) {
    console.error("❌ Create Inquiry Error:", err);
    res.status(500).json({ error: 'Server error' });
  }
};
