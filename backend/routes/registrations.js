const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Announcement = require('../models/Announcement');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateTicketCode(prefix = 'EVT') {
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${timestamp}-${rand}`;
}

// Produces a human-readable unique student pass ID, e.g. STU-A3B7-XK9Q
function generateStudentId() {
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `STU-${part1}-${part2}`;
}

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /api/registrations             -> all registrations (Admin only)
// GET /api/registrations?event=<id>  -> registrations of one event (Admin only)
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const filter = req.query.event ? { event: req.query.event } : {};
    const registrations = await Registration.find(filter)
      .populate('event', 'title date time venue capacity status')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    next(err);
  }
});

// GET /api/registrations/ticket/:code
// Public lookup — accepts either a ticket code (EVT-…/WTL-…) or a student pass ID (STU-…)
router.get('/ticket/:code', async (req, res, next) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    const registration = await Registration.findOne({
      $or: [{ ticketCode: code }, { studentId: code }],
    }).populate('event', 'title date time venue category capacity status imageUrl');

    if (!registration) {
      return res.status(404).json({
        message: 'Ticket pass not found. Please check your Ticket Code or Student Pass ID.',
      });
    }

    res.json(registration);
  } catch (err) {
    next(err);
  }
});

// GET /api/registrations/stats/:eventId or /:eventId/stats (Admin only)
const handleStats = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.params.id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const [confirmedCount, waitlistedCount, checkedInCount, deptAgg, yearAgg] = await Promise.all([
      Registration.countDocuments({ event: event._id, status: 'Confirmed' }),
      Registration.countDocuments({ event: event._id, status: 'Waitlisted' }),
      Registration.countDocuments({ event: event._id, status: 'Confirmed', checkedIn: true }),
      Registration.aggregate([
        { $match: { event: event._id, status: 'Confirmed' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Registration.aggregate([
        { $match: { event: event._id, status: 'Confirmed' } },
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const capacity = event.capacity || 1;
    const attendanceRate = confirmedCount > 0 ? Math.round((checkedInCount / confirmedCount) * 100) : 0;
    const capacityUtilization = Math.min(Math.round((confirmedCount / capacity) * 100), 100);

    res.json({
      event: {
        _id: event._id,
        title: event.title,
        capacity: event.capacity,
        date: event.date,
        time: event.time,
        venue: event.venue,
        status: event.status,
      },
      totalCapacity: event.capacity,
      confirmedCount,
      waitlistedCount,
      checkedInCount,
      attendanceRate,
      capacityUtilization,
      departmentBreakdown: deptAgg.map((d) => ({ name: d._id || 'Unknown', count: d.count })),
      yearBreakdown: yearAgg.map((y) => ({ name: y._id || 'Unknown', count: y.count })),
    });
  } catch (err) {
    next(err);
  }
};

router.get('/stats/:eventId', requireAdmin, handleStats);
router.get('/:eventId/stats', requireAdmin, handleStats);

// POST /api/registrations -> register a student for an event (or join waitlist)
router.post('/', optionalAuth, async (req, res, next) => {
  const eventId = req.body.event || req.body.eventId;
  const { name, email, phone, department, year, joinWaitlist } = req.body || {};

  // Input validation
  if (!eventId) return res.status(400).json({ message: 'Event ID is required' });
  if (!name || name.trim().length < 2)
    return res.status(400).json({ message: 'Full name is required (at least 2 characters)' });
  const cleanEmail = String(email || '').toLowerCase().trim();
  if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    return res.status(400).json({ message: 'Valid email address is required' });
  }
  const cleanPhone = String(phone || '').trim();
  if (!cleanPhone || !/^\d{10}$/.test(cleanPhone)) {
    return res.status(400).json({ message: 'Phone must be exactly 10 digits' });
  }
  if (!department || !department.trim()) return res.status(400).json({ message: 'Department is required' });
  if (!year || !['1st Year', '2nd Year', '3rd Year', '4th Year'].includes(year)) {
    return res.status(400).json({ message: 'Valid year is required' });
  }

  let session = null;
  let useTransaction = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch {
    session = null;
    useTransaction = false;
  }

  try {
    const opts = useTransaction ? { session } : {};

    const event = await Event.findById(eventId, null, opts);
    if (!event) {
      if (useTransaction) await session.abortTransaction();
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status === 'Cancelled') {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({
        message: 'This event has been cancelled and is no longer accepting registrations',
      });
    }

    if (event.status === 'Draft') {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({ message: 'This event is currently in draft mode and not published' });
    }

    const todayUTC = new Date(new Date().toISOString().slice(0, 10));
    if (new Date(event.date) < todayUTC) {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({ message: 'Registration is closed for this past event' });
    }

    // Duplicate check
    const alreadyRegistered = await Registration.findOne({ event: event._id, email: cleanEmail }, null, opts);
    if (alreadyRegistered) {
      if (useTransaction) await session.abortTransaction();
      const statusMsg =
        alreadyRegistered.status === 'Waitlisted'
          ? `You are already on the waitlist for this event (#${alreadyRegistered.waitlistPosition})`
          : 'You are already registered for this event';
      return res.status(409).json({ message: statusMsg, registration: alreadyRegistered });
    }

    // Find if a student account exists for this email or token
    let studentDoc = null;
    if (req.student?.id) {
      studentDoc = await Student.findById(req.student.id);
    }
    if (!studentDoc) {
      studentDoc = await Student.findOne({ email: cleanEmail });
    }

    // Capacity check
    const confirmedCount = await Registration.countDocuments({ event: event._id, status: 'Confirmed' }, opts);

    let status = 'Confirmed';
    let waitlistPosition = 0;
    let ticketCode = '';
    let studentId = '';

    if (confirmedCount >= event.capacity) {
      // Event is full
      if (!joinWaitlist) {
        if (useTransaction) await session.abortTransaction();
        return res.status(400).json({
          message: 'Sorry, this event is completely sold out',
          canJoinWaitlist: true,
        });
      }
      // Join Waitlist
      status = 'Waitlisted';
      const currentWaitlisted = await Registration.countDocuments(
        { event: event._id, status: 'Waitlisted' },
        opts,
      );
      waitlistPosition = currentWaitlisted + 1;
      ticketCode = generateTicketCode('WTL');
    } else {
      ticketCode = generateTicketCode('EVT');
    }

    // Consistent Student Pass ID (reuses existing student's studentId, or generates new one)
    if (studentDoc?.studentId) {
      studentId = studentDoc.studentId;
    } else {
      studentId = generateStudentId();
      if (studentDoc) {
        studentDoc.studentId = studentId;
        await studentDoc.save();
      }
    }

    // Create registration
    let registration;
    const docData = {
      event: event._id,
      student: studentDoc?._id || null,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      department: department.trim(),
      year,
      status,
      waitlistPosition,
      ticketCode,
      studentId,
    };

    if (useTransaction) {
      const created = await Registration.create([docData], { session });
      registration = created[0];
      await session.commitTransaction();
    } else {
      registration = await Registration.create(docData);
    }

    // Populate event details for the response
    await registration.populate('event', 'title date time venue category capacity status imageUrl');

    // Create In-App Notification for the Student
    try {
      await Notification.create({
        student: studentDoc?._id || null,
        email: cleanEmail,
        event: event._id,
        registration: registration._id,
        title:
          status === 'Confirmed'
            ? `Registration Confirmed: ${event.title}`
            : `Added to Waitlist: ${event.title}`,
        message:
          status === 'Confirmed'
            ? `Your seat is confirmed! Ticket Code: ${ticketCode}. Your Student Pass ID is ${studentId}.`
            : `You are #${waitlistPosition} on the waitlist. You will receive automatic notification if a seat opens up.`,
        type: status === 'Confirmed' ? 'RegistrationConfirmation' : 'WaitlistNotice',
        ticketCode,
      });
    } catch (notifErr) {
      console.error('Failed to create registration notification:', notifErr.message);
    }

    return res.status(201).json(registration);
  } catch (err) {
    if (useTransaction && session) {
      await session.abortTransaction().catch(() => {});
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You are already registered for this event' });
    }
    return next(err);
  } finally {
    if (session) {
      session.endSession();
    }
  }
});

// POST /api/registrations/check-in, /verify-ticket, /verify -> Check in an attendee (Admin only, duplicate-safe)
router.post(['/check-in', '/verify-ticket', '/verify'], requireAdmin, async (req, res, next) => {
  try {
    const { ticketCode, studentId, registrationId } = req.body || {};

    let query = {};
    if (ticketCode) {
      query.ticketCode = String(ticketCode).trim().toUpperCase();
    } else if (studentId) {
      query.studentId = String(studentId).trim().toUpperCase();
    } else if (registrationId) {
      query._id = registrationId;
    } else {
      return res.status(400).json({ message: 'Ticket code, Student ID, or Registration ID is required' });
    }

    const registration = await Registration.findOne(query).populate('event', 'title date time venue status');
    if (!registration) {
      return res.status(404).json({ message: 'No registration found matching provided code' });
    }

    if (registration.status === 'Waitlisted') {
      return res.status(400).json({
        message: `Cannot check in: Student is on the waitlist (#${registration.waitlistPosition}). Seat is not confirmed.`,
      });
    }

    if (registration.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot check in: This registration was cancelled.' });
    }

    // Prevent duplicate check-in
    if (registration.checkedIn) {
      const timeStr = registration.checkedInAt
        ? new Date(registration.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'earlier';
      return res.status(409).json({
        message: `Duplicate Check-in Alert! ${registration.name} was already checked in at ${timeStr}.`,
        registration,
      });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    res.json({ message: `Check-in confirmed for ${registration.name}!`, registration });
  } catch (err) {
    next(err);
  }
});

// POST /api/registrations/undo-check-in -> Revert a check-in (Admin only)
router.post('/undo-check-in', requireAdmin, async (req, res, next) => {
  try {
    const { registrationId, ticketCode, studentId } = req.body || {};
    let query;
    if (registrationId) query = { _id: registrationId };
    else if (ticketCode) query = { ticketCode: String(ticketCode).trim().toUpperCase() };
    else if (studentId) query = { studentId: String(studentId).trim().toUpperCase() };
    else return res.status(400).json({ message: 'Ticket code or registration ID is required' });

    const registration = await Registration.findOne(query).populate('event', 'title');
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    registration.checkedIn = false;
    registration.checkedInAt = null;
    await registration.save();

    res.json({ message: `Check-in reverted for ${registration.name}`, registration });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/registrations/:id -> Remove/cancel registration & trigger Automatic Seat Allocation
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    const eventId = registration.event;
    const wasConfirmed = registration.status === 'Confirmed';

    await Registration.findByIdAndDelete(req.params.id);

    // Automatic Waitlist Seat Allocation
    if (wasConfirmed) {
      const nextInLine = await Registration.findOne({
        event: eventId,
        status: 'Waitlisted',
      }).sort({ createdAt: 1 });

      if (nextInLine) {
        nextInLine.status = 'Confirmed';
        nextInLine.ticketCode = generateTicketCode('EVT');
        nextInLine.waitlistPosition = 0;
        await nextInLine.save();

        // Re-number remaining waitlisted students
        const remainingWaitlisted = await Registration.find({
          event: eventId,
          status: 'Waitlisted',
        }).sort({ createdAt: 1 });

        for (let i = 0; i < remainingWaitlisted.length; i++) {
          remainingWaitlisted[i].waitlistPosition = i + 1;
          await remainingWaitlisted[i].save();
        }

        // Post notification in Event Communication Centre
        const eventDoc = await Event.findById(eventId);
        if (eventDoc) {
          await Announcement.create({
            event: eventId,
            title: 'Automatic Seat Allocation',
            message: `A seat opened up for "${eventDoc.title}" and was automatically allocated to ${nextInLine.name} (#1 on the waitlist)!`,
            type: 'SeatAllocation',
          });

          // Also create student notification
          await Notification.create({
            student: nextInLine.student,
            email: nextInLine.email,
            event: eventId,
            registration: nextInLine._id,
            title: `Seat Allocated: ${eventDoc.title}!`,
            message: `You were moved from the waitlist to Confirmed! Your new ticket code is ${nextInLine.ticketCode}.`,
            type: 'SeatAllocation',
            ticketCode: nextInLine.ticketCode,
          });
        }
      }
    }

    res.json({ message: 'Registration removed successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
