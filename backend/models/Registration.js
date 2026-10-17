const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
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
  },
  { timestamps: true }
);

// One student (email) can register only once per event
registrationSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
