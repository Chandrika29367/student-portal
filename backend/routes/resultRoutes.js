const express = require('express');
const router = express.Router();
const {
  getStudentResults,
  postSemesterResult,
} = require('../controllers/resultController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/student/:studentId', protect, getStudentResults);
router.post('/', protect, admin, postSemesterResult);

module.exports = router;
