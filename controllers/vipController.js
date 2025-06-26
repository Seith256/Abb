const User = require('../models/User');

exports.approveWithdrawal = async (req, res) => {
  const { userId, date } = req.body;
  try {
    const user = await User.findById(userId);
    const request = user.withdrawalRequests.find(w => new Date(w.date).getTime() === new Date(date).getTime());
    if (!request || request.status !== 'pending') return res.status(400).json({ error: 'Invalid request' });

    if (user.balance >= request.amount) {
      request.status = 'approved';
      user.balance -= request.amount;

      const txn = user.transactions.find(t =>
        t.type === 'withdrawal' &&
        t.amount === -request.amount &&
        t.status === 'pending'
      );
      if (txn) txn.status = 'completed';

      await user.save();
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Insufficient balance' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.approveVIP = async (req, res) => {
  const { userId, date } = req.body;
  try {
    const vipLevels = [1800, 6000, 10000, 13000, 28000, 60000, 75000, 150000, 400000, 600000];
    const user = await User.findById(userId);
    const request = user.vipRequests.find(v => new Date(v.date).getTime() === new Date(date).getTime());
    if (!request || request.status !== 'pending') return res.status(400).json({ error: 'Invalid VIP request' });

    request.status = 'approved';
    user.vipLevel = request.level;
    user.dailyProfit = vipLevels[request.level - 1];
    user.vipApprovedDate = new Date();
    user.vipDaysCompleted = 0;
    user.lastProfitDate = null;

    const txn = user.transactions.find(t =>
      t.type.includes('VIP') &&
      t.amount === -request.amount &&
      t.status === 'pending'
    );
    if (txn) txn.status = 'completed';

    await user.save();
    res.json({ success: true, message: `VIP ${user.vipLevel} approved` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.processDailyProfits = async (req, res) => {
  try {
    const users = await User.find({ vipLevel: { $gt: 0 } });
    const now = new Date();

    for (let user of users) {
      if (!user.lastProfitDate || new Date(user.lastProfitDate).toDateString() !== now.toDateString()) {
        if (user.vipDaysCompleted < 60) {
          user.balance += user.dailyProfit;
          user.totalEarnings += user.dailyProfit;
          user.vipDaysCompleted += 1;
          user.lastProfitDate = now;

          user.transactions.push({
            type: 'Daily VIP Profit',
            amount: user.dailyProfit,
            date: now,
            status: 'completed'
          });

          await user.save();
        }
      }
    }

    res.json({ success: true, message: 'Daily profits processed' });
  } catch (err) {
    res.status(500).json({ error: 'Error processing daily profits' });
  }
};
