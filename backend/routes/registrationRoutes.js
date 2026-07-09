const express = require('express');
const router = express.Router();
const {
  getStudentRegistrations,
  registerCourses,
  updateRegistrationGrade,
} = require('../controllers/registrationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/student/:studentId', protect, getStudentRegistrations);
router.post('/register', protect, registerCourses);
router.put('/grade', protect, admin, updateRegistrationGrade);

module.exports = router;
