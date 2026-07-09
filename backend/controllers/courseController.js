const Course = require('../models/Course');
const CourseRegistration = require('../models/CourseRegistration');
const Student = require('../models/Student');

// @desc    Get courses (with filters)
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const query = {};

    if (req.query.department) {
      query.department = { $in: [req.query.department, 'All'] };
    }
    if (req.query.semester) {
      query.semester = parseInt(req.query.semester);
    }

    const courses = await Course.find(query).sort({ courseCode: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available courses for a student's semester & department
// @route   GET /api/courses/available
// @access  Private (Student)
const getAvailableCourses = async (req, res) => {
  try {
    if (req.user.role !== 'student' || !req.user.studentId) {
      return res.status(400).json({ message: 'Only students can request available courses' });
    }

    const student = await Student.findById(req.user.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get registered course IDs
    const registrations = await CourseRegistration.find({ student: student._id });
    const registeredCourseIds = registrations.map((r) => r.course.toString());

    // Find courses matching student department/semester and not in registered list
    const availableCourses = await Course.find({
      department: { $in: [student.department, 'All'] },
      semester: student.semester,
      _id: { $nin: registeredCourseIds },
    });

    res.json(availableCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  const { courseCode, title, credits, department, semester, description } = req.body;

  try {
    const courseExists = await Course.findOne({ courseCode });

    if (courseExists) {
      return res.status(400).json({ message: 'Course Code already exists' });
    }

    const course = await Course.create({
      courseCode,
      title,
      credits,
      department,
      semester,
      description,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.courseCode = req.body.courseCode || course.courseCode;
    course.title = req.body.title || course.title;
    course.credits = req.body.credits || course.credits;
    course.department = req.body.department || course.department;
    course.semester = req.body.semester || course.semester;
    course.description = req.body.description || course.description;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete any student registrations for this course
    await CourseRegistration.deleteMany({ course: course._id });

    await Course.deleteOne({ _id: course._id });
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  getAvailableCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
