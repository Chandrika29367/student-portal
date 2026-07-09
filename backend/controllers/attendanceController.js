const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Course = require('../models/Course');
const CourseRegistration = require('../models/CourseRegistration');

// @desc    Get student attendance records/summary
// @route   GET /api/attendance/student/:studentId
// @access  Private (Admin or linked student)
const getStudentAttendanceSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Access control
    if (req.user.role === 'student' && req.user.studentId.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all registrations to find courses
    const registrations = await CourseRegistration.find({ student: studentId }).populate('course');
    
    // Get all attendance logs
    const logs = await Attendance.find({ student: studentId }).populate('course');

    // Calculate course-wise attendance
    const courseStats = registrations.map((reg) => {
      const courseLogs = logs.filter((log) => log.course._id.toString() === reg.course._id.toString());
      const totalClasses = courseLogs.length;
      const presentClasses = courseLogs.filter((log) => log.status === 'Present').length;
      
      const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : reg.attendance || 0.0;

      return {
        courseId: reg.course._id,
        courseCode: reg.course.courseCode,
        courseTitle: reg.course.title,
        totalClasses,
        presentClasses,
        percentage: parseFloat(percentage.toFixed(2)),
      };
    });

    // Calculate overall attendance
    const totalLogs = logs.length;
    const presentLogs = logs.filter((l) => l.status === 'Present').length;
    const overallPercentage = totalLogs > 0 ? (presentLogs / totalLogs) * 100 : 0.0;

    res.json({
      overallPercentage: parseFloat(overallPercentage.toFixed(2)),
      totalLogs,
      presentLogs,
      courseStats,
      logs: logs.slice(0, 100), // Return recent 100 logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk record attendance
// @route   POST /api/attendance/record
// @access  Private/Admin
const recordBulkAttendance = async (req, res) => {
  const { courseId, date, records } = req.body; // records: [{studentId (ObjectId), status: 'Present'/'Absent'}]

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Please provide attendance records' });
    }

    const attendanceDate = new Date(date || Date.now());
    // Strip time for daily uniqueness
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const savedLogs = [];

    for (const record of records) {
      // Upsert attendance
      const attendanceLog = await Attendance.findOneAndUpdate(
        {
          student: record.studentId,
          course: courseId,
          date: attendanceDate,
        },
        {
          status: record.status,
        },
        {
          upsert: true,
          new: true,
        }
      );
      savedLogs.push(attendanceLog);

      // Update student registration specific attendance
      const allStudentLogs = await Attendance.find({
        student: record.studentId,
        course: courseId,
      });

      const totalClasses = allStudentLogs.length;
      const presentClasses = allStudentLogs.filter((l) => l.status === 'Present').length;
      const courseAttendancePct = (presentClasses / totalClasses) * 100;

      // Save back to CourseRegistration
      await CourseRegistration.findOneAndUpdate(
        { student: record.studentId, course: courseId },
        { attendance: parseFloat(courseAttendancePct.toFixed(2)) }
      );

      // Recalculate student overall attendance
      const allRegistrations = await CourseRegistration.find({ student: record.studentId });
      const attendanceSum = allRegistrations.reduce((acc, curr) => acc + curr.attendance, 0);
      const avgAttendance = allRegistrations.length > 0 ? (attendanceSum / allRegistrations.length) : 0;

      await Student.findByIdAndUpdate(record.studentId, {
        attendancePercentage: parseFloat(avgAttendance.toFixed(2)),
      });
    }

    res.status(201).json({
      message: `Successfully recorded attendance for ${savedLogs.length} students`,
      logs: savedLogs,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getStudentAttendanceSummary,
  recordBulkAttendance,
};
