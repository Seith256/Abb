const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => res.send('Login Placeholder'));
router.post('/register', (req, res) => res.send('Register Placeholder'));

module.exports = router;
