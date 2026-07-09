const Student = require('../models/Student');
const Course = require('../models/Course');
const CourseRegistration = require('../models/CourseRegistration');
const Fee = require('../models/Fee');
const Notice = require('../models/Notice');
const Result = require('../models/Result');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalCourses = await Course.countDocuments();
    
    // Departments count
    const departments = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Information Technology'];
    const totalDepartments = departments.length;

    // Average CGPA
    const avgCgpaResult = await Student.aggregate([
      { $group: { _id: null, avgCgpa: { $avg: '$cgpa' } } }
    ]);
    const averageCgpa = avgCgpaResult.length > 0 ? parseFloat(avgCgpaResult[0].avgCgpa.toFixed(2)) : 0.0;

    // Fee Status counts
    const paidFeesCount = await Student.countDocuments({ feeStatus: 'Paid' });
    const pendingFeesCount = await Student.countDocuments({ feeStatus: 'Pending' });

    // Department student distribution
    const deptDistribution = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const departmentStats = deptDistribution.map((d) => ({
      name: d._id,
      value: d.count,
    }));

    // CGPA distribution
    // Bands: <6.0, 6.0-7.0, 7.0-8.0, 8.0-9.0, >9.0
    const students = await Student.find({}, 'cgpa');
    const cgpaBands = {
      'Below 6.0': 0,
      '6.0 - 7.0': 0,
      '7.0 - 8.0': 0,
      '8.0 - 9.0': 0,
      '9.0 - 10.0': 0,
    };

    students.forEach((s) => {
      const g = s.cgpa;
      if (g < 6.0) cgpaBands['Below 6.0']++;
      else if (g >= 6.0 && g < 7.0) cgpaBands['6.0 - 7.0']++;
      else if (g >= 7.0 && g < 8.0) cgpaBands['7.0 - 8.0']++;
      else if (g >= 8.0 && g < 9.0) cgpaBands['8.0 - 9.0']++;
      else cgpaBands['9.0 - 10.0']++;
    });

    const cgpaStats = Object.keys(cgpaBands).map((k) => ({
      name: k,
      count: cgpaBands[k],
    }));

    // Monthly Fee Collection (mocked from Fee payments)
    const paidFeesList = await Fee.find({ status: 'Paid' }).populate('student');
    let totalCollected = 0;
    paidFeesList.forEach((f) => {
      totalCollected += f.amount;
    });

    res.json({
      totalStudents,
      totalCourses,
      totalDepartments,
      averageCgpa,
      feeStats: {
        paid: paidFeesCount,
        pending: pendingFeesCount,
        totalCollected,
      },
      departmentStats,
      cgpaStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Student Dashboard Stats
// @route   GET /api/dashboard/student/:studentId
// @access  Private (Admin or linked student)
const getStudentStats = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Access control
    if (req.user.role === 'student' && req.user.studentId.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Registered courses count
    const registeredCoursesCount = await CourseRegistration.countDocuments({ student: studentId });

    // Pending fee invoices count
    const pendingFeesCount = await Fee.countDocuments({ student: studentId, status: 'Pending' });

    // SGPA history
    const results = await Result.find({ student: studentId }).sort({ semester: 1 });
    const gpaHistory = results.map((r) => ({
      semester: `Sem ${r.semester}`,
      sgpa: r.sgpa,
      cgpa: r.cgpaAtSemester,
    }));

    // Latest 5 notices for this student's department/semester
    const notices = await Notice.find({
      $or: [
        { targetDepartment: 'All', targetSemester: 0 },
        { targetDepartment: student.department, targetSemester: 0 },
        { targetDepartment: 'All', targetSemester: student.semester },
        { targetDepartment: student.department, targetSemester: student.semester },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      student,
      registeredCoursesCount,
      pendingFeesCount,
      gpaHistory,
      notices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getStudentStats,
};
