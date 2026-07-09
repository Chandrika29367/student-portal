const express = require('express');
const router = express.Router();
const {
  getCourses,
  getAvailableCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCourses)
  .post(protect, admin, createCourse);

router.route('/available')
  .get(protect, getAvailableCourses);

router.route('/:id')
  .put(protect, admin, updateCourse)
  .delete(protect, admin, deleteCourse);

module.exports = router;
