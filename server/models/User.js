const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: String,
  amount: Number,
  date: Date,
  status: String,
});

const requestSchema = new mongoose.Schema({
  amount: Number,
  date: Date,
  proof: String,
  phone: String,
  network: String,
  level: Number,
  status: { type: String, default: 'pending' }
});

const referralSchema = new mongoose.Schema({
  email: String,
  bonus: Number,
  lastBonusDate: Date
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  balance: { type: Number, default: 0 },
  vipLevel: { type: Number, default: 0 },
  dailyProfit: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 },
  transactions: [transactionSchema],
  rechargeRequests: [requestSchema],
  withdrawalRequests: [requestSchema],
  vipRequests: [requestSchema],
  referrals: [referralSchema],
  invitationCode: String,
  invitedBy: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
