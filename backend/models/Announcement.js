const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: 140,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['Announcement', 'ScheduleChange', 'VenueUpdate', 'SeatAllocation', 'Cancellation'],
      default: 'Announcement',
    },
    targetAudience: {
      type: String,
      enum: ['All', 'Registered', 'Waitlisted'],
      default: 'All',
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);

