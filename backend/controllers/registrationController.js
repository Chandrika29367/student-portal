const CourseRegistration = require('../models/CourseRegistration');
const Course = require('../models/Course');
const Student = require('../models/Student');

// @desc    Get course registrations for a student
// @route   GET /api/registrations/student/:studentId
// @access  Private (Admin or linked student)
const getStudentRegistrations = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Access control
    if (req.user.role === 'student' && req.user.studentId.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const registrations = await CourseRegistration.find({ student: studentId })
      .populate('course')
      .sort({ registeredAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a student for courses
// @route   POST /api/registrations/register
// @access  Private (Admin or student registering themselves)
const registerCourses = async (req, res) => {
  const { studentId, courseIds } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Access control
    if (req.user.role === 'student' && req.user.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Access denied: cannot register other students' });
    }

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ message: 'Please provide course IDs to register' });
    }

    // Make sure courses exist
    const courses = await Course.find({ _id: { $in: courseIds } });
    if (courses.length !== courseIds.length) {
      return res.status(400).json({ message: 'One or more selected courses do not exist' });
    }

    const createdRegistrations = [];

    for (const course of courses) {
      // Avoid duplicate registration
      const alreadyRegistered = await CourseRegistration.findOne({
        student: student._id,
        course: course._id,
      });

      if (!alreadyRegistered) {
        const reg = await CourseRegistration.create({
          student: student._id,
          course: course._id,
          semester: student.semester, // register for student's current semester
        });
        createdRegistrations.push(reg);
      }
    }

    res.status(201).json({
      message: `Successfully registered for ${createdRegistrations.length} courses`,
      registrations: createdRegistrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update grade and attendance for a course registration
// @route   PUT /api/registrations/grade
// @access  Private/Admin
const updateRegistrationGrade = async (req, res) => {
  const { registrationId, grade, attendance } = req.body;

  try {
    const registration = await CourseRegistration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({ message: 'Course registration not found' });
    }

    if (grade !== undefined) {
      registration.grade = grade;
    }
    if (attendance !== undefined) {
      registration.attendance = parseFloat(attendance);
    }

    const updatedRegistration = await registration.save();

    // Recalculate student's average attendance from all registrations
    const studentId = registration.student;
    const allRegistrations = await CourseRegistration.find({ student: studentId });
    const attendanceSum = allRegistrations.reduce((acc, curr) => acc + curr.attendance, 0);
    const avgAttendance = allRegistrations.length > 0 ? (attendanceSum / allRegistrations.length) : 0;

    await Student.findByIdAndUpdate(studentId, {
      attendancePercentage: parseFloat(avgAttendance.toFixed(2)),
    });

    res.json(updatedRegistration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getStudentRegistrations,
  registerCourses,
  updateRegistrationGrade,
};
