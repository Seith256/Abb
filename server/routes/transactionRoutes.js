const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('Get transactions Placeholder'));

module.exports = router;
