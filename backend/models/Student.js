const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Information Technology'],
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
    },
    parentContact: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    cgpa: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 10.0,
    },
    attendancePercentage: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 100.0,
    },
    feeStatus: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', StudentSchema);
