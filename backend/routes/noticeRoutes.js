const express = require('express');
const router = express.Router();
const {
  getNotices,
  createNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotices)
  .post(protect, admin, createNotice);

router.delete('/:id', protect, admin, deleteNotice);

module.exports = router;
