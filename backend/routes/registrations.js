const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/registrations             -> all registrations (Admin only)
// GET /api/registrations?event=<id>  -> registrations of one event (Admin only)
router.get('/', requireAdmin, async (req, res) => {
  const filter = req.query.event ? { event: req.query.event } : {};
  const registrations = await Registration.find(filter)
    .populate('event', 'title')
    .sort({ createdAt: -1 });
  res.json(registrations);
});

const mongoose = require('mongoose');

// POST /api/registrations -> register a student for an event
router.post('/', async (req, res, next) => {
  const { event: eventId, name, email, phone, department, year } = req.body || {};

  // Input validation
  if (!eventId) return res.status(400).json({ message: 'Event ID is required' });
  if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Full name is required (at least 2 characters)' });
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
    // Standalone mongo instances may not support transactions; proceed safely without
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

    const todayUTC = new Date(new Date().toISOString().slice(0, 10));
    if (new Date(event.date) < todayUTC) {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({ message: 'Registration is closed for this past event' });
    }

    // Check duplicate email for this event
    const alreadyRegistered = await Registration.findOne(
      { event: event._id, email: cleanEmail },
      null,
      opts
    );
    if (alreadyRegistered) {
      if (useTransaction) await session.abortTransaction();
      return res.status(409).json({ message: 'You are already registered for this event' });
    }

    // Check current capacity
    const registeredCount = await Registration.countDocuments({ event: event._id }, opts);
    if (registeredCount >= event.capacity) {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({ message: 'Sorry, this event is completely sold out' });
    }

    // Create registration
    let registration;
    if (useTransaction) {
      const created = await Registration.create(
        [{
          event: event._id,
          name: name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          department: department.trim(),
          year,
        }],
        { session }
      );
      registration = created[0];
      await session.commitTransaction();
    } else {
      registration = await Registration.create({
        event: event._id,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        department: department.trim(),
        year,
      });
    }

    // Populate event details for immediate confirmation modal rendering
    await registration.populate('event', 'title date time venue category capacity');

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

// DELETE /api/registrations/:id (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const registration = await Registration.findByIdAndDelete(req.params.id);
  if (!registration) return res.status(404).json({ message: 'Registration not found' });
  res.json({ message: 'Registration removed' });
});

module.exports = router;
