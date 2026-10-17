const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const router = express.Router();

// GET /api/events               -> all events
// GET /api/events?upcoming=true -> only events from today onwards
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.upcoming === 'true') {
    const todayUTC = new Date(new Date().toISOString().slice(0, 10));
    filter.date = { $gte: todayUTC };
  }
  const events = await Event.find(filter).sort({ date: 1 });

  // Count registrations for each event
  const counts = await Registration.aggregate([{ $group: { _id: '$event', count: { $sum: 1 } } }]);
  const countMap = {};
  counts.forEach((c) => (countMap[c._id.toString()] = c.count));

  res.json(events.map((e) => ({ ...e.toObject(), registered: countMap[e._id.toString()] || 0 })));
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const registered = await Registration.countDocuments({ event: event._id });
  res.json({ ...event.toObject(), registered });
});

// POST /api/events
router.post('/', async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json(event);
});

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

// DELETE /api/events/:id  (also removes its registrations)
router.delete('/:id', async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  await Registration.deleteMany({ event: event._id });
  res.json({ message: 'Event deleted' });
});

module.exports = router;
