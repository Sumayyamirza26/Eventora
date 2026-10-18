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

// POST /api/registrations -> register a student for an event
router.post('/', async (req, res) => {
  const { event: eventId, name, email, phone, department, year } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const todayUTC = new Date(new Date().toISOString().slice(0, 10));
  if (event.date < todayUTC) {
    return res.status(400).json({ message: 'Registration is closed for this event' });
  }

  const registered = await Registration.countDocuments({ event: event._id });
  if (registered >= event.capacity) {
    return res.status(400).json({ message: 'Sorry, this event is full' });
  }

  const alreadyRegistered = await Registration.findOne({
    event: event._id,
    email: String(email || '').toLowerCase().trim(),
  });
  if (alreadyRegistered) {
    return res.status(409).json({ message: 'You are already registered for this event' });
  }

  const registration = await Registration.create({ event: event._id, name, email, phone, department, year });
  res.status(201).json(registration);
});

// DELETE /api/registrations/:id (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const registration = await Registration.findByIdAndDelete(req.params.id);
  if (!registration) return res.status(404).json({ message: 'Registration not found' });
  res.json({ message: 'Registration removed' });
});

module.exports = router;
