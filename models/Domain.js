const mongoose = require('mongoose');

const DomainSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    features: {
        type: [String],
        default: ['Free Domain Registration', 'Free Security Suite']
    },
    img: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Domain', DomainSchema);
