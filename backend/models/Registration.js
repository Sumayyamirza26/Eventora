const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: [2, 'Name is too short'] },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^\d{10}$/, 'Phone must be 10 digits'],
    },
    department: { type: String, required: [true, 'Department is required'], trim: true },
    year: {
      type: String,
      required: [true, 'Year is required'],
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    },
    ticketCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    studentId: {
      type: String,
      uppercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Waitlisted', 'Cancelled'],
      default: 'Confirmed',
    },
    waitlistPosition: {
      type: Number,
      default: 0,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One student (email) can register only once per event
registrationSchema.index({ event: 1, email: 1 }, { unique: true });
registrationSchema.index({ student: 1, event: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
