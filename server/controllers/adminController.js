const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    const users = await User.find();
    const totalUsers = users.length;
    const pendingRecharges = users.reduce((sum, user) => sum + user.rechargeRequests.filter(r => r.status === 'pending').length, 0);
    const pendingWithdrawals = users.reduce((sum, user) => sum + user.withdrawalRequests.filter(w => w.status === 'pending').length, 0);
    const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
    res.json({ totalUsers, pendingRecharges, pendingWithdrawals, totalBalance });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.approveRecharge = async (req, res) => {
  const { userId, date } = req.body;
  try {
    const user = await User.findById(userId);
    const request = user.rechargeRequests.find(r => new Date(r.date).getTime() === new Date(date).getTime());
    if (!request || request.status !== 'pending') return res.status(400).json({ error: 'Invalid request' });

    request.status = 'approved';
    user.balance += request.amount;

    const txn = user.transactions.find(t =>
      t.type === 'recharge' &&
      t.amount === request.amount &&
      t.status === 'pending'
    );
    if (txn) txn.status = 'completed';

    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error approving recharge' });
  }
};
