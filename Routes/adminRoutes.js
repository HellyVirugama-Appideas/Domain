// const express = require('express');
// const router = express.Router();
// const adminController = require('../controller/adminController');
// const upload = require('../middleware/upload');


// // ====================== EJS PAGES ======================
// router.get('/login', adminController.renderLogin);
// router.post('/login', adminController.handleLogin);
// router.get('/logout', (req, res) => {
//     req.session.destroy(() => res.redirect('/admin/login'));
// });

// router.get('/dashboard', adminController.requireAdmin, adminController.renderDashboard);

// // ====================== DOMAIN CRUD (Form based) ======================
// router.post('/domains', adminController.requireAdmin, upload.single('img'), adminController.createDomain);
// router.post('/domains/:id/edit', adminController.requireAdmin, upload.single('img'), adminController.updateDomain);
// router.post('/domains/:id/delete', adminController.requireAdmin, adminController.deleteDomain);

// // ====================== INQUIRY ======================
// router.post('/inquiries/:id/status', adminController.requireAdmin, adminController.updateInquiryStatus);
// router.post('/inquiries/:id/delete', adminController.requireAdmin, adminController.deleteInquiry);

// // ====================== JSON API (Public Landing Page ke liye) ======================
// router.get('/api/domains', adminController.getAllDomainsAdmin);
// router.get('/api/inquiries', adminController.requireAdmin, adminController.getAllInquiries);
// router.get('/api/visitors', adminController.requireAdmin, adminController.getVisitCount);

// module.exports = router;

const express = require('express');
const router  = express.Router();
const adminController = require('../controller/adminController');
const upload  = require('../middleware/upload');

// ── AUTH ──────────────────────────────────────────────
router.get('/login',  adminController.renderLogin);
router.post('/login', adminController.handleLogin);
// logout: cookie clear (session destroy hataya — JWT use ho raha hai ab)
router.get('/logout', adminController.logoutAdmin);

// ── DASHBOARD ─────────────────────────────────────────
router.get('/dashboard', adminController.requireAdmin, adminController.renderDashboard);

// ── DOMAINS ───────────────────────────────────────────
router.post('/domains',            adminController.requireAdmin, upload.single('img'), adminController.createDomain);
router.post('/domains/:id/edit',   adminController.requireAdmin, upload.single('img'), adminController.updateDomain);
router.post('/domains/:id/delete', adminController.requireAdmin, adminController.deleteDomain);

// ── INQUIRIES ─────────────────────────────────────────
router.post('/inquiries/:id/status', adminController.requireAdmin, adminController.updateInquiryStatus);
router.post('/inquiries/:id/delete', adminController.requireAdmin, adminController.deleteInquiry);

// ── JSON API ──────────────────────────────────────────
router.get('/api/domains',   adminController.getAllDomainsAdmin);
router.get('/api/inquiries', adminController.requireAdmin, adminController.getAllInquiries);
router.get('/api/visitors',  adminController.requireAdmin, adminController.getVisitCount);

module.exports = router;