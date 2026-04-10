const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  status: { type: String, default: 'new' }   // new / contacted / closed
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', InquirySchema);