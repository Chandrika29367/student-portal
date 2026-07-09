const express = require('express');
const router = express.Router();
const { getAdminStats, getStudentStats } = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/admin', protect, admin, getAdminStats);
router.get('/student/:studentId', protect, getStudentStats);

module.exports = router;
