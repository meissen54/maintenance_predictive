const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' }, // Le token expire après 1 heure
});

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);