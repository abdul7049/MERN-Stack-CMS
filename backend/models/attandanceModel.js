const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: true,
  },
  totalPresent: {
    type: Number,
    default: 0,
  },
  totalAbsent: {
    type: Number,
    default: 0,
  },
  attendanceDate: {
    type: Date,
    default: Date.now,
  },
  attendanceStatus: {
    type: String,
    enum: ['present', 'absent'], // Attendance can only be 'present' or 'absent'
    required: true,
},
});

module.exports = mongoose.model("Attendance", attendanceSchema);
