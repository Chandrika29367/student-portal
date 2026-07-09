const Student = require('../models/Student');
const User = require('../models/User');
const CourseRegistration = require('../models/CourseRegistration');
const Fee = require('../models/Fee');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');

// @desc    Get all students (with search, filter, pagination)
// @route   GET /api/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { rollNumber: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex }
      ];
    }

    // Filters
    if (req.query.department) {
      query.department = req.query.department;
    }
    if (req.query.semester) {
      query.semester = parseInt(req.query.semester);
    }
    if (req.query.feeStatus) {
      query.feeStatus = req.query.feeStatus;
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      students,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private (Admin or linked student)
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Access control: Admin or the student themselves
    if (req.user.role === 'student' && req.user.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Access denied: cannot view other student profiles' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new student (and linked user account)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  const {
    studentId,
    rollNumber,
    name,
    email,
    phoneNumber,
    department,
    semester,
    dateOfBirth,
    address,
    parentContact,
    profilePicture,
    cgpa,
    attendancePercentage,
    feeStatus,
  } = req.body;

  try {
    // Check if student exists
    const studentExists = await Student.findOne({
      $or: [{ studentId }, { rollNumber }, { email }],
    });

    if (studentExists) {
      return res.status(400).json({ message: 'Student ID, Roll Number, or Email already exists' });
    }

    const student = await Student.create({
      studentId,
      rollNumber,
      name,
      email,
      phoneNumber,
      department,
      semester,
      dateOfBirth,
      address,
      parentContact,
      profilePicture: profilePicture || '',
      cgpa: cgpa || 0.0,
      attendancePercentage: attendancePercentage || 0.0,
      feeStatus: feeStatus || 'Pending',
    });

    // Create user login account (default password: "password123" or "temp_" + rollNumber)
    const defaultPassword = 'password123';
    await User.create({
      username: rollNumber,
      password: defaultPassword,
      role: 'student',
      studentId: student._id,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private (Admin or linked student)
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Access control
    if (req.user.role === 'student' && req.user.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Access denied: cannot update other profiles' });
    }

    if (req.user.role === 'admin') {
      // Admin can update all fields
      student.studentId = req.body.studentId || student.studentId;
      student.rollNumber = req.body.rollNumber || student.rollNumber;
      student.name = req.body.name || student.name;
      student.email = req.body.email || student.email;
      student.phoneNumber = req.body.phoneNumber || student.phoneNumber;
      student.department = req.body.department || student.department;
      student.semester = req.body.semester || student.semester;
      student.dateOfBirth = req.body.dateOfBirth || student.dateOfBirth;
      student.address = req.body.address || student.address;
      student.parentContact = req.body.parentContact || student.parentContact;
      student.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : student.profilePicture;
      student.cgpa = req.body.cgpa !== undefined ? req.body.cgpa : student.cgpa;
      student.attendancePercentage = req.body.attendancePercentage !== undefined ? req.body.attendancePercentage : student.attendancePercentage;
      student.feeStatus = req.body.feeStatus || student.feeStatus;
    } else {
      // Student can only update selected fields
      student.phoneNumber = req.body.phoneNumber || student.phoneNumber;
      student.address = req.body.address || student.address;
      student.parentContact = req.body.parentContact || student.parentContact;
      student.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : student.profilePicture;
    }

    const updatedStudent = await student.save();

    // If email or roll number changed, update linked User username if necessary
    if (req.user.role === 'admin') {
      const user = await User.findOne({ studentId: student._id });
      if (user && user.username !== student.rollNumber) {
        user.username = student.rollNumber;
        await user.save();
      }
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete student and all records
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete linked User
    await User.deleteOne({ studentId: student._id });

    // Delete all course registrations
    await CourseRegistration.deleteMany({ student: student._id });

    // Delete fee records
    await Fee.deleteMany({ student: student._id });

    // Delete results
    await Result.deleteMany({ student: student._id });

    // Delete attendance
    await Attendance.deleteMany({ student: student._id });

    // Delete Student
    await Student.deleteOne({ _id: student._id });

    res.json({ message: 'Student and all related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
