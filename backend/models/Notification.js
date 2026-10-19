const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['RegistrationConfirmation', 'WaitlistNotice', 'SeatAllocation', 'Cancellation', 'General'],
      default: 'General',
    },
    ticketCode: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ student: 1, createdAt: -1 });
notificationSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

