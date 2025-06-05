const express = require('express');
const router = express.Router();
const { loginUser, getAllSchedules } = require('../controllers/userController');

router.post('/login', loginUser);
router.get('/schedules', getAllSchedules); // 🔥 admin route

module.exports = router;
