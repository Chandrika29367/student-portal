const Notice = require('../models/Notice');
const Student = require('../models/Student');

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
const getNotices = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student' && req.user.studentId) {
      const student = await Student.findById(req.user.studentId);
      if (student) {
        query = {
          $or: [
            { targetDepartment: 'All', targetSemester: 0 },
            { targetDepartment: student.department, targetSemester: 0 },
            { targetDepartment: 'All', targetSemester: student.semester },
            { targetDepartment: student.department, targetSemester: student.semester },
          ],
        };
      }
    }

    const notices = await Notice.find(query)
      .populate('publishedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create notice
// @route   POST /api/notices
// @access  Private/Admin
const createNotice = async (req, res) => {
  const { title, content, targetDepartment, targetSemester } = req.body;

  try {
    const notice = await Notice.create({
      title,
      content,
      targetDepartment: targetDepartment || 'All',
      targetSemester: targetSemester !== undefined ? parseInt(targetSemester) : 0,
      publishedBy: req.user._id,
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await Notice.deleteOne({ _id: notice._id });
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotices,
  createNotice,
  deleteNotice,
};
