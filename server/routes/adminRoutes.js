const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const reportController = require('../controllers/reportController');
const vipController = require('../controllers/vipController');

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.post('/approve-recharge', adminController.approveRecharge);
router.post('/approve-withdrawal', vipController.approveWithdrawal);
router.post('/approve-vip', vipController.approveVIP);
router.post('/daily-profit', vipController.processDailyProfits);
router.post('/report', reportController.generateReport);

module.exports = router;
