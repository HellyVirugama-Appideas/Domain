const Domain = require('../models/Domain');
const Inquiry = require('../models/Inquiry');
const { VisitCount, Visitor } = require('../models/Visit');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ================== MAIL ==================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ================== CAPTCHA API ==================
exports.getCaptcha = (req, res) => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;

  // Store correct answer in session
  req.session.captcha = num1 + num2;

  res.json({ num1, num2 });
};

// ================== GET DOMAINS ==================
exports.getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.find().sort({ createdAt: -1 });
    res.json(domains);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ================== TRACK VISIT ==================
exports.trackVisit = async (req, res) => {
  try {
    let cookieId = req.cookies.cookieId;

    if (!cookieId) {
      cookieId = Math.random().toString(36).substring(2);

      await Visitor.create({
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        device: req.headers['user-agent']?.includes('Mobile') ? 'Mobile' : 'Desktop',
        cookieId
      });

      let visitDoc = await VisitCount.findOne();
      if (!visitDoc) {
        visitDoc = await VisitCount.create({ count: 0 });
      }

      visitDoc.count += 1;
      await visitDoc.save();

      res.cookie('cookieId', cookieId, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
      });

      return res.json({ message: 'New visitor', count: visitDoc.count });
    }

    // Existing visitor
    const visitor = await Visitor.findOne({ cookieId });
    if (visitor) {
      visitor.clicks += 1;
      visitor.lastSeen = new Date();
      await visitor.save();
    }

    res.json({ message: 'Returning visitor' });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ================== CREATE INQUIRY ==================
exports.createInquiry = async (req, res) => {
  try {
    const { name, email, phone, message, interestedDomain, answer } = req.body;

    // ✅ CAPTCHA CHECK (SESSION BASED)
    if (!answer || parseInt(answer) !== req.session.captcha) {
      return res.status(400).json({ error: 'Wrong Captcha' });
    }

    // Save inquiry
    const inquiry = await Inquiry.create({
      name,
      email,
      phone: phone || '',
      message,
      interestedDomain: interestedDomain || 'www.domania.com'
    });

    // Get visitor info
    const visitor = await Visitor.findOne({ cookieId: req.cookies.cookieId });

    console.log(`📧 Sending email for inquiry: ${inquiry._id}`);

    // ================== SEND MAIL ==================
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Inquiry - ${interestedDomain || 'Domain'}`,
      html: `
        <h2>New Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Domain:</strong> ${interestedDomain}</p>
        <p><strong>Message:</strong> ${message}</p>

        <hr>
        <h3>Visitor Info</h3>
        <p><strong>IP:</strong> ${visitor?.ip || 'N/A'}</p>
        <p><strong>Device:</strong> ${visitor?.device || 'N/A'}</p>

        <hr>
        <small>ID: ${inquiry._id}</small>
      `
    });

    // Clear captcha after use
    req.session.captcha = null;

    res.json({ success: true, message: 'Inquiry sent successfully' });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: 'Server error' });
  }
};