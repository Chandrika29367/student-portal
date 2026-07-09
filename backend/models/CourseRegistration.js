const mongoose = require('mongoose');

const CourseRegistrationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    grade: {
      type: String,
      default: 'Pending',
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'Pending'],
    },
    attendance: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 100.0,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate student-course registrations
CourseRegistrationSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseRegistration', CourseRegistrationSchema);
