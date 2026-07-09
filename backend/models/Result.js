const mongoose = require('mongoose');

const GradeItemSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  grade: {
    type: String,
    required: true,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
  },
});

const ResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    sgpa: {
      type: Number,
      required: true,
      min: 0.0,
      max: 10.0,
    },
    cgpaAtSemester: {
      type: Number,
      required: true,
      min: 0.0,
      max: 10.0,
    },
    grades: [GradeItemSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index: student and semester unique
ResultSchema.index({ student: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Result', ResultSchema);
