const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const { requireStudent, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function createToken(student) {
  return jwt.sign(
    {
      id: student._id,
      email: student.email,
      name: student.name,
      studentId: student.studentId,
      role: 'student',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function generateTicketCode(prefix = 'EVT') {
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${timestamp}-${rand}`;
}

// ── Ensure Demo Student Exists ───────────────────────────────────────────────
async function ensureDemoStudent() {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const demoEmail = 'student@college.edu';
    const exists = await Student.findOne({ email: demoEmail });
    if (!exists) {
      const hashedPassword = await Student.hashPassword('student123');
      await Student.create({
        name: 'Aarav Sharma',
        email: demoEmail,
        password: hashedPassword,
        studentId: 'STU-DEMO-2026',
        phone: '9876543210',
        department: 'Computer Science',
        year: '3rd Year',
        interests: ['Tech', 'Workshop'],
      });
      console.log('Demo student created: student@college.edu / student123');
    }
  } catch (err) {
    console.error('Demo student seeding error:', err.message);
  }
}
if (mongoose.connection.readyState === 1) {
  ensureDemoStudent();
} else {
  mongoose.connection.once('connected', ensureDemoStudent);
}

// ── POST /api/students/signup ────────────────────────────────────────────────
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, phone, department, year, interests } = req.body || {};

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Full name is required (at least 2 characters)' });
    }
    const cleanEmail = String(email || '').toLowerCase().trim();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return res.status(400).json({ message: 'Valid college email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await Student.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists. Please log in.' });
    }

    const hashedPassword = await Student.hashPassword(password);
    const studentId = Student.generateStudentId();

    const student = await Student.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      studentId,
      phone: phone ? String(phone).trim() : '',
      department: department ? String(department).trim() : 'Computer Science',
      year: year || '1st Year',
      interests: Array.isArray(interests) ? interests : [],
    });

    // Link any previous registrations made with this email
    await Registration.updateMany(
      { email: cleanEmail, student: null },
      { $set: { student: student._id, studentId: student.studentId } }
    );

    // Create welcome notification
    await Notification.create({
      student: student._id,
      email: student.email,
      title: 'Welcome to Eventora!',
      message: `Hi ${student.name}, your student account is active. Your official Student Pass ID is ${student.studentId}.`,
      type: 'General',
    });

    const token = createToken(student);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        phone: student.phone,
        department: student.department,
        year: student.year,
        interests: student.interests,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/students/login ─────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const student = await Student.findOne({ email: cleanEmail });

    if (!student) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Ensure studentId exists
    if (!student.studentId) {
      student.studentId = Student.generateStudentId();
      await student.save();
    }

    const token = createToken(student);

    res.json({
      message: 'Logged in successfully',
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        phone: student.phone,
        department: student.department,
        year: student.year,
        interests: student.interests,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/students/profile ────────────────────────────────────────────────
router.get('/profile', requireStudent, async (req, res, next) => {
  try {
    const student = await Student.findById(req.student.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/students/profile ────────────────────────────────────────────────
router.put('/profile', requireStudent, async (req, res, next) => {
  try {
    const { name, phone, department, year, interests } = req.body || {};
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (name && name.trim().length >= 2) student.name = name.trim();
    if (phone !== undefined) student.phone = String(phone).trim();
    if (department) student.department = String(department).trim();
    if (year) student.year = year;
    if (Array.isArray(interests)) student.interests = interests;

    await student.save();

    // Also sync updated name/phone on future lookups
    res.json({
      message: 'Profile updated successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        phone: student.phone,
        department: student.department,
        year: student.year,
        interests: student.interests,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/students/my-registrations ───────────────────────────────────────
router.get('/my-registrations', requireStudent, async (req, res, next) => {
  try {
    const student = await Student.findById(req.student.id);
    const email = student ? student.email : req.student.email;

    const registrations = await Registration.find({
      $or: [{ student: req.student.id }, { email }],
    })
      .populate('event')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/students/cancel-registration/:id ──────────────────────────────
router.post('/cancel-registration/:id', requireStudent, async (req, res, next) => {
  try {
    const student = await Student.findById(req.student.id);
    const email = student ? student.email : req.student.email;

    const registration = await Registration.findOne({
      _id: req.params.id,
      $or: [{ student: req.student.id }, { email }],
    }).populate('event');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found or unauthorized' });
    }

    if (registration.status === 'Cancelled') {
      return res.status(400).json({ message: 'This registration has already been cancelled' });
    }

    const eventId = registration.event?._id;
    const eventTitle = registration.event?.title || 'Campus Event';
    const wasConfirmed = registration.status === 'Confirmed';

    // Update status to Cancelled
    registration.status = 'Cancelled';
    await registration.save();

    // Notify the student about cancellation
    await Notification.create({
      student: req.student.id,
      email,
      event: eventId,
      registration: registration._id,
      title: `Registration Cancelled: ${eventTitle}`,
      message: `Your registration for "${eventTitle}" has been cancelled successfully.`,
      type: 'Cancellation',
      ticketCode: registration.ticketCode,
    });

    // Automatic waitlist promotion if cancelled registration was Confirmed
    if (wasConfirmed && eventId) {
      const nextInLine = await Registration.findOne({
        event: eventId,
        status: 'Waitlisted',
      }).sort({ createdAt: 1 });

      if (nextInLine) {
        nextInLine.status = 'Confirmed';
        nextInLine.ticketCode = generateTicketCode('EVT');
        nextInLine.waitlistPosition = 0;
        await nextInLine.save();

        // Re-number remaining waitlisted
        const remaining = await Registration.find({
          event: eventId,
          status: 'Waitlisted',
        }).sort({ createdAt: 1 });

        for (let i = 0; i < remaining.length; i++) {
          remaining[i].waitlistPosition = i + 1;
          await remaining[i].save();
        }

        // Notification for the promoted student
        await Notification.create({
          student: nextInLine.student,
          email: nextInLine.email,
          event: eventId,
          registration: nextInLine._id,
          title: `Seat Allocated for ${eventTitle}!`,
          message: `Good news! A seat opened up for "${eventTitle}" and was automatically allocated to you! Your ticket code is ${nextInLine.ticketCode}.`,
          type: 'SeatAllocation',
          ticketCode: nextInLine.ticketCode,
        });

        // Broadcast Announcement in Event Communication Centre
        await Announcement.create({
          event: eventId,
          title: 'Automatic Seat Allocation',
          message: `A seat opened up for "${eventTitle}" and was automatically allocated to waitlisted student ${nextInLine.name}!`,
          type: 'SeatAllocation',
        });
      }
    }

    res.json({
      message: 'Registration cancelled successfully',
      registration,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/students/notifications ──────────────────────────────────────────
router.get('/notifications', requireStudent, async (req, res, next) => {
  try {
    const student = await Student.findById(req.student.id);
    const email = student ? student.email : req.student.email;

    const notifications = await Notification.find({
      $or: [{ student: req.student.id }, { email }],
    })
      .populate('event', 'title date venue time')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      $or: [{ student: req.student.id }, { email }],
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/students/notifications/read-all ─────────────────────────────────
router.put('/notifications/read-all', requireStudent, async (req, res, next) => {
  try {
    const student = await Student.findById(req.student.id);
    const email = student ? student.email : req.student.email;

    await Notification.updateMany(
      { $or: [{ student: req.student.id }, { email }], read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/students/notifications/:id/read ─────────────────────────────────
router.put('/notifications/:id/read', requireStudent, async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $set: { read: true } });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/students/certificates ───────────────────────────────────────────
router.get('/certificates', requireStudent, async (req, res, next) => {
  try {
    const student = await Student.findById(req.student.id);
    const email = student ? student.email : req.student.email;

    const registrations = await Registration.find({
      $or: [{ student: req.student.id }, { email }],
      status: 'Confirmed',
    }).populate('event');

    const todayUTC = new Date().toISOString().slice(0, 10);

    // An event is eligible for certificate if event is completed, or event date is past, or student checked in
    const eligibleCertificates = registrations
      .filter((r) => {
        if (!r.event) return false;
        const isPast = r.event.date && r.event.date.toISOString().slice(0, 10) < todayUTC;
        const isCompleted = r.event.status === 'Completed';
        const isCheckedIn = Boolean(r.checkedIn);
        return isPast || isCompleted || isCheckedIn;
      })
      .map((r) => ({
        registrationId: r._id,
        ticketCode: r.ticketCode,
        studentId: r.studentId || student?.studentId || 'STU-OFFICIAL',
        studentName: r.name,
        department: r.department,
        year: r.year,
        checkedIn: r.checkedIn,
        checkedInAt: r.checkedInAt,
        event: {
          _id: r.event._id,
          title: r.event.title,
          category: r.event.category,
          date: r.event.date,
          time: r.event.time,
          venue: r.event.venue,
        },
        issueDate: r.checkedInAt || r.event.date || r.createdAt,
        certificateId: `CERT-${r._id.toString().slice(-6).toUpperCase()}-${(r.ticketCode || 'EVT').slice(-4)}`,
      }));

    res.json(eligibleCertificates);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
