const Result = require('../models/Result');
const Student = require('../models/Student');

// @desc    Get results for a student
// @route   GET /api/results/student/:studentId
// @access  Private (Admin or linked student)
const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Access control
    if (req.user.role === 'student' && req.user.studentId.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const results = await Result.find({ student: studentId })
      .populate('grades.course')
      .sort({ semester: 1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post/Update results for a student for a specific semester
// @route   POST /api/results
// @access  Private/Admin
const postSemesterResult = async (req, res) => {
  const { studentId, semester, sgpa, cgpaAtSemester, grades } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if result already exists for this semester
    let result = await Result.findOne({ student: studentId, semester });

    if (result) {
      result.sgpa = sgpa;
      result.cgpaAtSemester = cgpaAtSemester;
      result.grades = grades;
      await result.save();
    } else {
      result = await Result.create({
        student: studentId,
        semester,
        sgpa,
        cgpaAtSemester,
        grades,
      });
    }

    // Update student's overall CGPA based on the latest semester result,
    // or average SGPA across all semesters
    const allResults = await Result.find({ student: studentId });
    if (allResults.length > 0) {
      const sumSgpa = allResults.reduce((acc, curr) => acc + curr.sgpa, 0);
      const avgCgpa = sumSgpa / allResults.length;
      student.cgpa = parseFloat(avgCgpa.toFixed(2));
      await student.save();
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getStudentResults,
  postSemesterResult,
};
