const express = require('express');
const router = express.Router();
const {
  getFees,
  getStudentFees,
  createFee,
  updateFeeStatus,
} = require('../controllers/feeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getFees)
  .post(protect, admin, createFee);

router.get('/student/:studentId', protect, getStudentFees);
router.put('/:id', protect, admin, updateFeeStatus);

module.exports = router;
