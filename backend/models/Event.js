const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 100 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 1000 },
    date: { type: Date, required: [true, 'Date is required'] },
    time: { type: String, required: [true, 'Time is required'] },
    venue: { type: String, required: [true, 'Venue is required'], trim: true },
    category: {
      type: String,
      enum: ['Tech', 'Cultural', 'Sports', 'Workshop', 'Career', 'Other'],
      default: 'Other',
    },
    capacity: { type: Number, required: [true, 'Capacity is required'], min: [1, 'Capacity must be at least 1'] },
    imageUrl: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
