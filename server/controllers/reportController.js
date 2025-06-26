const User = require('../models/User');

exports.generateReport = async (req, res) => {
  const { type, dateFrom, dateTo } = req.body;

  try {
    const users = await User.find();
    const fromDate = dateFrom ? new Date(dateFrom) : new Date(0);
    const toDate = dateTo ? new Date(dateTo) : new Date();

    if (type === 'transactions') {
      const allTransactions = users.flatMap(user => 
        user.transactions.map(txn => ({ ...txn.toObject(), user: user.name }))
      );
      const filtered = allTransactions.filter(t =>
        new Date(t.date) >= fromDate && new Date(t.date) <= toDate
      );
      const deposits = filtered.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const withdrawals = filtered.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return res.json({ total: filtered.length, deposits, withdrawals, transactions: filtered.slice(0, 50) });
    }

    if (type === 'users') {
      const filteredUsers = users.filter(u =>
        new Date(u.createdAt) >= fromDate && new Date(u.createdAt) <= toDate
      );
      const grouped = {};
      filteredUsers.forEach(u => {
        const date = new Date(u.createdAt).toLocaleDateString();
        grouped[date] = (grouped[date] || 0) + 1;
      });
      return res.json({ users: filteredUsers.length, grouped });
    }

    if (type === 'profits') {
      const vipUsers = users.filter(u => u.vipLevel > 0);
      const totalDailyProfit = vipUsers.reduce((sum, u) => sum + u.dailyProfit, 0);
      const totalEarnings = vipUsers.reduce((sum, u) => sum + u.totalEarnings, 0);
      const levels = {};
      vipUsers.forEach(u => {
        levels[u.vipLevel] = (levels[u.vipLevel] || 0) + 1;
      });
      return res.json({ vipUsers: vipUsers.length, totalDailyProfit, totalEarnings, levels });
    }

    res.status(400).json({ error: 'Invalid report type' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error generating report' });
  }
};
