const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  ip:        { type: String, default: '' },
  userAgent: { type: String, default: '' },
  browser:   { type: String, default: '' },
  os:        { type: String, default: '' },
  device:    { type: String, default: 'Desktop' },
  country:   { type: String, default: '' },
  clicks:    { type: Number, default: 1 },
  pages:     [{ type: String }],
  date:      { type: String, default: '' }, // "YYYY-MM-DD" format — NEW FIELD
  lastSeen:  { type: Date, default: Date.now }
}, { timestamps: true });

// IP + Date = unique visitor per day
VisitorSchema.index({ ip: 1, date: 1 }, { unique: true });

const VisitCountSchema = new mongoose.Schema({
  count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = {
  Visitor:    mongoose.model('Visitor', VisitorSchema),
  VisitCount: mongoose.model('Visit',   VisitCountSchema)
};
