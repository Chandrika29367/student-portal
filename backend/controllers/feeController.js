const Fee = require('../models/Fee');
const Student = require('../models/Student');

// @desc    Get all fees
// @route   GET /api/fees
// @access  Private/Admin
const getFees = async (req, res) => {
  try {
    const query = {};

    if (req.query.studentId) {
      // Find student first if search is by studentId string
      const student = await Student.findOne({ studentId: req.query.studentId });
      if (student) {
        query.student = student._id;
      } else {
        // Return empty if student not found
        return res.json([]);
      }
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const fees = await Fee.find(query)
      .populate('student')
      .sort({ createdAt: -1 });

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fee records for a student
// @route   GET /api/fees/student/:studentId
// @access  Private (Admin or linked student)
const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Access control
    if (req.user.role === 'student' && req.user.studentId.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const fees = await Fee.find({ student: studentId })
      .populate('student')
      .sort({ semester: -1 });

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new fee record
// @route   POST /api/fees
// @access  Private/Admin
const createFee = async (req, res) => {
  const { studentId, semester, amount, dueDate } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if fee already exists for this semester
    const feeExists = await Fee.findOne({ student: studentId, semester });
    if (feeExists) {
      return res.status(400).json({ message: 'Fee record already exists for this semester' });
    }

    const fee = await Fee.create({
      student: studentId,
      semester,
      amount,
      status: 'Pending',
      dueDate,
    });

    // Update student overall feeStatus to Pending
    student.feeStatus = 'Pending';
    await student.save();

    res.status(201).json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update fee record (pay/modify)
// @route   PUT /api/fees/:id
// @access  Private/Admin
const updateFeeStatus = async (req, res) => {
  const { status, transactionId } = req.body;

  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    fee.status = status || fee.status;
    if (status === 'Paid') {
      fee.paidDate = new Date();
      fee.transactionId = transactionId || `TXN${Date.now()}`;
    } else if (status === 'Pending') {
      fee.paidDate = undefined;
      fee.transactionId = undefined;
    }

    const updatedFee = await fee.save();

    // Check student's other fees
    const studentId = fee.student;
    const pendingFees = await Fee.findOne({ student: studentId, status: 'Pending' });

    // Update overall student fee status
    const student = await Student.findById(studentId);
    if (student) {
      student.feeStatus = pendingFees ? 'Pending' : 'Paid';
      await student.save();
    }

    res.json(updatedFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getFees,
  getStudentFees,
  createFee,
  updateFeeStatus,
};
