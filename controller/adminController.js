// const Domain = require('../models/Domain');
// const Inquiry = require('../models/Inquiry');
// const Visit = require('../models/Visit');

// // ====================== EJS RENDER FUNCTIONS ======================

// // Login Page
// exports.renderLogin = (req, res) => {
//   res.render('admin/login', { error: req.query.error || null });
// };

// // Handle Login
// exports.handleLogin = (req, res) => {
//   try {
//     const { username, password } = req.body;
//     if (username === 'admin' && password === 'admin123') {
//       req.session.isAdmin = true;
//       return res.redirect('/admin/dashboard');
//     }
//     res.redirect('/admin/login?error=Invalid username or password');
//   } catch (err) {
//     console.error(err);
//     res.redirect('/admin/login?error=Server error');
//   }
// };

// // Middleware - Check Admin Login
// exports.requireAdmin = (req, res, next) => {
//   if (req.session.isAdmin) return next();
//   res.redirect('/admin/login');
// };

// // Dashboard (All data + try-catch)
// exports.renderDashboard = async (req, res) => {
//   try {
//     const domains = await Domain.find().sort({ createdAt: -1 });
//     const inquiries = await Inquiry.find().sort({ createdAt: -1 });
//     let visitDoc = await Visit.findOne();
//     if (!visitDoc) visitDoc = await Visit.create({ count: 0 });

//     res.render('admin/dashboard', {
//       domains,
//       inquiries,
//       totalVisitors: visitDoc.count,
//       success: req.query.success || null,
//       error: req.query.error || null
//     });
//   } catch (err) {
//     console.error(err);
//     res.render('admin/dashboard', {
//       domains: [],
//       inquiries: [],
//       totalVisitors: 0,
//       success: null,
//       error: 'Something went wrong while loading dashboard'
//     });
//   }
// };

// // ====================== DOMAIN CRUD (with try-catch + redirect) ======================

// exports.createDomain = async (req, res) => {
//   try {
//     const data = req.body;

//     if (req.file) {
//       data.img = '/uploads/' + req.file.filename;
//     }

//     await Domain.create(data);

//     res.redirect('/admin/dashboard?success=Domain added successfully');
//   } catch (err) {
//     console.error(err);
//     res.redirect('/admin/dashboard?error=Failed to add domain');
//   }
// };

// exports.updateDomain = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;

//     if (req.file) {
//       data.img = '/uploads/' + req.file.filename;
//     }

//     await Domain.findByIdAndUpdate(id, data, { new: true });

//     res.redirect('/admin/dashboard?success=Domain updated successfully');
//   } catch (err) {
//     console.error(err);
//     res.redirect('/admin/dashboard?error=Failed to update domain');
//   }
// };

// exports.deleteDomain = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Domain.findByIdAndDelete(id);
//     res.redirect('/admin/dashboard?success=Domain deleted successfully');
//   } catch (err) {
//     console.error(err);
//     res.redirect('/admin/dashboard?error=Failed to delete domain');
//   }
// };

// // ====================== INQUIRY ======================
// exports.updateInquiryStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Inquiry.findByIdAndUpdate(id, { status: req.body.status });
//     res.redirect('/admin/dashboard?success=Inquiry status updated');
//   } catch (err) {
//     console.error(err);
//     res.redirect('/admin/dashboard?error=Failed to update status');
//   }
// };

// // ====================== OPTIONAL JSON API (Landing page ke liye) ======================
// exports.getAllDomainsAdmin = async (req, res) => {
//   try {
//     const domains = await Domain.find().sort({ createdAt: -1 });
//     res.json(domains);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// exports.getAllInquiries = async (req, res) => {
//   try {
//     const inquiries = await Inquiry.find().sort({ createdAt: -1 });
//     res.json(inquiries);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// exports.getVisitCount = async (req, res) => {
//   try {
//     let visit = await Visit.findOne();
//     if (!visit) visit = await Visit.create({ count: 0 });
//     res.json({ totalVisitors: visit.count });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };


// const Domain = require('../models/Domain');
// const Inquiry = require('../models/Inquiry');
// const { Visitor, VisitCount } = require('../models/Visit');
// const Admin = require('../models/Admin');
// const jwt = require('jsonwebtoken');

// // ====================== AUTH ======================

// // Login Page
// exports.renderLogin = (req, res) => {
//   res.render('admin/login', { error: req.query.error || null });
// };

// // 🔐 Handle Login (DB based)
// // exports.handleLogin = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     const admin = await Admin.findOne({ email });
// //     if (!admin) {
// //       return res.redirect('/admin/login?error=Invalid email');
// //     }

// //     const isMatch = await admin.comparePassword(password);
// //     if (!isMatch) {
// //       return res.redirect('/admin/login?error=Invalid password');
// //     }

// //     // ✅ Session set
// //     req.session.adminId = admin._id;

// //     res.redirect('/admin/dashboard');

// //   } catch (err) {
// //     console.error(err);
// //     res.redirect('/admin/login?error=Server error');
// //   }
// // };

// exports.handleLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.redirect('/admin/login?error=Invalid email');
//     }

//     const isMatch = await admin.comparePassword(password);
//     if (!isMatch) {
//       return res.redirect('/admin/login?error=Invalid password');
//     }

//     // ✅ TOKEN CREATE
//     const token = jwt.sign(
//       { id: admin._id },
//       process.env.JWT_SECRET || 'secret123',
//       { expiresIn: '1d' }
//     );

//     // ✅ COOKIE SET
//     res.cookie('adminToken', token, {
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000 // 1 day
//     });

//     res.redirect('/admin/dashboard');

//   } catch (err) {
//     console.error(err);
//     res.redirect('/admin/login?error=Server error');
//   }
// };

// // 🚪 Logout
// exports.logoutAdmin = (req, res) => {
//   req.session.destroy(() => {
//     res.clearCookie('adminToken');
//     res.redirect('/admin/login');
//   });
// };

// // 🔐 Middleware
// exports.requireAdmin = (req, res, next) => {
//   try {
//     const token = req.cookies.adminToken;

//     if (!token) {
//       return res.redirect('/admin/login');
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || 'secret123'
//     );

//     req.adminId = decoded.id;

//     next();

//   } catch (err) {
//     return res.redirect('/admin/login');
//   }
// };

// // ====================== DASHBOARD ======================

// // exports.renderDashboard = async (req, res) => {
// //   try {
// //     const domains   = await Domain.find().sort({ createdAt: -1 });
// //     const inquiries = await Inquiry.find().sort({ createdAt: -1 });
// //     const visitors  = await Visitor.find().sort({ createdAt: -1 }).limit(100);

// //     let vc = await VisitCount.findOne();
// //     if (!vc) vc = await VisitCount.create({ count: 0 });

// //     // Total clicks across all visitors
// //     const totalClicks = visitors.reduce((sum, v) => sum + (v.clicks || 0), 0);

// //     res.render('admin/dashboard', {
// //       domains, inquiries,
// //       totalVisitors: vc.count,
// //       visitors,
// //       totalClicks,
// //       success: req.query.success || null,
// //       error:   req.query.error   || null
// //     });
// //   } catch (err) {
// //     console.error(err);
// //     res.render('admin/dashboard', {
// //       domains: [], inquiries: [], totalVisitors: 0,
// //       visitors: [], totalClicks: 0, success: null,
// //       error: 'Something went wrong'
// //     });
// //   }
// // };

// // ====================== DASHBOARD ======================
// exports.renderDashboard = async (req, res) => {
//   try {
//     // Fetch all required data
//     const domains = await Domain.find().sort({ createdAt: -1 });
//     const inquiries = await Inquiry.find().sort({ createdAt: -1 });
//     const visitors = await Visitor.find()
//       .sort({ lastSeen: -1 })   // Latest active visitors first
//       .limit(100);

//     // ✅ Atomic way to get (and ensure) VisitCount document
//     let visitCountDoc = await VisitCount.findOneAndUpdate(
//       {}, 
//       { $inc: { count: 0 } },        // No increment, just ensure document exists
//       { new: true, upsert: true }
//     );

//     // Calculate total clicks from all visitors
//     const totalClicks = visitors.reduce((sum, visitor) => {
//       return sum + (visitor.clicks || 0);
//     }, 0);

//     // Optional: Today's visitors count (if you want to show)
//     const today = new Date().toISOString().slice(0, 10);
//     const todayVisitors = await Visitor.countDocuments({ date: today });

//     res.render('admin/dashboard', {
//       domains,
//       inquiries,
//       visitors,
//       totalVisitors: visitCountDoc.count,     // ← Global visit count (main counter)
//       totalClicks,                            // Total clicks across all visitors
//       todayVisitors,                          // Bonus: Today's unique visitors
//       success: req.query.success || null,
//       error: req.query.error || null
//     });

//   } catch (err) {
//     console.error('Dashboard Render Error:', err);

//     // Fallback render in case of error
//     res.render('admin/dashboard', {
//       domains: [],
//       inquiries: [],
//       visitors: [],
//       totalVisitors: 0,
//       totalClicks: 0,
//       todayVisitors: 0,
//       success: null,
//       error: 'Something went wrong while loading dashboard'
//     });
//   }
// };
// // ====================== DOMAIN CRUD ======================

// exports.createDomain = async (req, res) => {
//   try {
//     const { name, price, description, features } = req.body;

//     // features comes as comma-separated string or array
//     let featuresArr = [];
//     if (Array.isArray(features)) {
//       featuresArr = features.filter(f => f.trim() !== '');
//     } else if (typeof features === 'string' && features.trim()) {
//       featuresArr = features.split('\n').map(f => f.trim()).filter(f => f !== '');
//     }

//     const data = {
//       name,
//       price,
//       description,
//       features: featuresArr.length > 0 ? featuresArr : ['Free Domain Registration', 'Free Security Suite', 'Strong Keywords', 'Quality Rankings']
//     };

//     if (req.file) data.img = '/uploads/' + req.file.filename;

//     await Domain.create(data);
//     res.redirect('/admin/dashboard?success=Domain added successfully');
//   } catch (err) {
//     console.error(err);
//     res.redirect('/admin/dashboard?error=Failed to add domain');
//   }
// };

// exports.updateDomain = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, price, description, features } = req.body;

//     let featuresArr = [];
//     if (Array.isArray(features)) {
//       featuresArr = features.filter(f => f.trim() !== '');
//     } else if (typeof features === 'string' && features.trim()) {
//       featuresArr = features.split('\n').map(f => f.trim()).filter(f => f !== '');
//     }

//     const data = {
//       name, price, description,
//       features: featuresArr.length > 0 ? featuresArr : ['Free Domain Registration', 'Free Security Suite', 'Strong Keywords', 'Quality Rankings']
//     };

//     if (req.file) data.img = '/uploads/' + req.file.filename;

//     await Domain.findByIdAndUpdate(id, data, { new: true });
//     res.redirect('/admin/dashboard?success=Domain updated successfully');
//   } catch (err) {
//     console.error(err);
//     res.redirect('/admin/dashboard?error=Failed to update domain');
//   }
// };

// exports.deleteDomain = async (req, res) => {
//   try {
//     await Domain.findByIdAndDelete(req.params.id);
//     res.redirect('/admin/dashboard?success=Domain deleted successfully');
//   } catch (err) {
//     console.error(err);
//     res.redirect('/admin/dashboard?error=Failed to delete domain');
//   }
// };

// // ====================== INQUIRY ======================

// // ─── INQUIRY ──────────────────────────────────────────────────────────────────
// exports.updateInquiryStatus = async (req, res) => {
//   try {
//     await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status });
//     res.redirect('/admin/dashboard?success=Status updated');
//   } catch (err) {
//     res.redirect('/admin/dashboard?error=Failed to update status');
//   }
// };

// exports.deleteInquiry = async (req, res) => {
//   try {
//     await Inquiry.findByIdAndDelete(req.params.id);
//     res.redirect('/admin/dashboard?success=Inquiry deleted');
//   } catch (err) {
//     res.redirect('/admin/dashboard?error=Failed to delete inquiry');
//   }
// };

// // ─── API ──────────────────────────────────────────────────────────────────────
// exports.getAllDomainsAdmin  = async (req, res) => {
//   try { res.json(await Domain.find().sort({ createdAt: -1 })); }
//   catch { res.status(500).json({ error: 'Server error' }); }
// };
// exports.getAllInquiries = async (req, res) => {
//   try { res.json(await Inquiry.find().sort({ createdAt: -1 })); }
//   catch { res.status(500).json({ error: 'Server error' }); }
// };
// exports.getVisitCount = async (req, res) => {
//   try {
//     let vc = await VisitCount.findOne();
//     if (!vc) vc = await VisitCount.create({ count: 0 });
//     res.json({ totalVisitors: vc.count });
//   } catch { res.status(500).json({ error: 'Server error' }); }
// };

const Domain = require('../models/Domain');
const Inquiry = require('../models/Inquiry');
const { Visitor, VisitCount } = require('../models/Visit');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// ====================== AUTH ======================

exports.renderLogin = (req, res) => {
  res.render('admin/login', { error: req.query.error || null });
};

exports.handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.redirect('/admin/login?error=Invalid email');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.redirect('/admin/login?error=Invalid password');
    }

    // ✅ JWT TOKEN CREATE
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1d' }
    );

    // ✅ COOKIE SET (httpOnly - secure)
    res.cookie('adminToken', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.redirect('/admin/dashboard');

  } catch (err) {
    console.error(err);
    res.redirect('/admin/login?error=Server error');
  }
};

// 🚪 Logout — cookie clear karo
exports.logoutAdmin = (req, res) => {
  res.clearCookie('adminToken');
  res.redirect('/admin/login');
};

// 🔐 Middleware — JWT cookie check
exports.requireAdmin = (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.redirect('/admin/login');
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret123'
    );

    req.adminId = decoded.id;
    next();

  } catch (err) {
    return res.redirect('/admin/login');
  }
};

// ====================== DASHBOARD ======================

exports.renderDashboard = async (req, res) => {
  try {
    const domains   = await Domain.find().sort({ createdAt: -1 });
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    const visitors  = await Visitor.find()
      .sort({ lastSeen: -1 })
      .limit(100);

    // Ensure VisitCount document exists (atomic upsert)
    let visitCountDoc = await VisitCount.findOneAndUpdate(
      {},
      { $inc: { count: 0 } },
      { new: true, upsert: true }
    );

    // Total clicks across all visitors
    const totalClicks = visitors.reduce((sum, v) => sum + (v.clicks || 0), 0);

    // Today's unique visitors
    const today = new Date().toISOString().slice(0, 10);
    const todayVisitors = await Visitor.countDocuments({ date: today });

    res.render('admin/dashboard', {
      domains,
      inquiries,
      visitors,
      totalVisitors: visitCountDoc.count,
      totalClicks,
      todayVisitors,
      success: req.query.success || null,
      error:   req.query.error   || null
    });

  } catch (err) {
    console.error('Dashboard Render Error:', err);
    res.render('admin/dashboard', {
      domains:      [],
      inquiries:    [],
      visitors:     [],
      totalVisitors: 0,
      totalClicks:   0,
      todayVisitors: 0,
      success: null,
      error: 'Something went wrong while loading dashboard'
    });
  }
};

// ====================== DOMAIN CRUD ======================

exports.createDomain = async (req, res) => {
  try {
    const { name, price, description, features } = req.body;

    let featuresArr = [];
    if (Array.isArray(features)) {
      featuresArr = features.filter(f => f.trim() !== '');
    } else if (typeof features === 'string' && features.trim()) {
      featuresArr = features.split('\n').map(f => f.trim()).filter(f => f !== '');
    }

    const data = {
      name, price, description,
      features: featuresArr.length > 0 ? featuresArr : ['Free Domain Registration', 'Free Security Suite', 'Strong Keywords', 'Quality Rankings']
    };

    if (req.file) data.img = '/uploads/' + req.file.filename;

    await Domain.create(data);
    res.redirect('/admin/dashboard?success=Domain added successfully');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard?error=Failed to add domain');
  }
};

exports.updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, features } = req.body;

    let featuresArr = [];
    if (Array.isArray(features)) {
      featuresArr = features.filter(f => f.trim() !== '');
    } else if (typeof features === 'string' && features.trim()) {
      featuresArr = features.split('\n').map(f => f.trim()).filter(f => f !== '');
    }

    const data = {
      name, price, description,
      features: featuresArr.length > 0 ? featuresArr : ['Free Domain Registration', 'Free Security Suite', 'Strong Keywords', 'Quality Rankings']
    };

    if (req.file) data.img = '/uploads/' + req.file.filename;

    await Domain.findByIdAndUpdate(id, data, { new: true });
    res.redirect('/admin/dashboard?success=Domain updated successfully');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard?error=Failed to update domain');
  }
};

exports.deleteDomain = async (req, res) => {
  try {
    await Domain.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard?success=Domain deleted successfully');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard?error=Failed to delete domain');
  }
};

// ====================== INQUIRY ======================

exports.updateInquiryStatus = async (req, res) => {
  try {
    await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.redirect('/admin/dashboard?success=Status updated&tab=1');
  } catch (err) {
    res.redirect('/admin/dashboard?error=Failed to update status&tab=1');
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard?success=Inquiry deleted&tab=1');
  } catch (err) {
    res.redirect('/admin/dashboard?error=Failed to delete inquiry&tab=1');
  }
};

// ====================== JSON API ======================

exports.getAllDomainsAdmin = async (req, res) => {
  try { res.json(await Domain.find().sort({ createdAt: -1 })); }
  catch { res.status(500).json({ error: 'Server error' }); }
};

exports.getAllInquiries = async (req, res) => {
  try { res.json(await Inquiry.find().sort({ createdAt: -1 })); }
  catch { res.status(500).json({ error: 'Server error' }); }
};

exports.getVisitCount = async (req, res) => {
  try {
    let vc = await VisitCount.findOne();
    if (!vc) vc = await VisitCount.create({ count: 0 });
    res.json({ totalVisitors: vc.count });
  } catch { res.status(500).json({ error: 'Server error' }); }
};