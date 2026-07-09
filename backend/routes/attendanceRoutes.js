const express = require('express');
const router = express.Router();
const {
  getStudentAttendanceSummary,
  recordBulkAttendance,
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/student/:studentId', protect, getStudentAttendanceSummary);
router.post('/record', protect, admin, recordBulkAttendance);

module.exports = router;
