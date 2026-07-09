const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    department: {
      type: String,
      required: true,
      enum: ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Information Technology', 'All'],
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', CourseSchema);
