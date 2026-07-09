const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    targetDepartment: {
      type: String,
      default: 'All',
      enum: ['All', 'Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Information Technology'],
    },
    targetSemester: {
      type: Number,
      default: 0, // 0 means all semesters
      min: 0,
      max: 8,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notice', NoticeSchema);
