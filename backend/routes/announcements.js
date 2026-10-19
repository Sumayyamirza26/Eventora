const express = require('express');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/announcements - Fetch announcements (Public)
// Can filter by event: /api/announcements?event=<eventId>
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.event) {
      filter.event = req.query.event;
    }

    const announcements = await Announcement.find(filter)
      .populate('event', 'title date time venue status')
      .sort({ pinned: -1, createdAt: -1 })
      .limit(50);

    res.json(announcements);
  } catch (err) {
    next(err);
  }
});

// GET /api/announcements/:id - Single announcement
router.get('/:id', async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate('event', 'title date time venue status');
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json(announcement);
  } catch (err) {
    next(err);
  }
});

// POST /api/announcements - Create an announcement (Admin only)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { event: eventId, title, message, type, targetAudience, pinned } = req.body || {};

    if (!eventId) return res.status(400).json({ message: 'Event is required' });
    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Target event not found' });

    const announcement = await Announcement.create({
      event: event._id,
      title: title.trim(),
      message: message.trim(),
      type: type || 'Announcement',
      targetAudience: targetAudience || 'All',
      pinned: Boolean(pinned),
    });

    await announcement.populate('event', 'title date time venue status');

    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/announcements/:id - Delete announcement (Admin only)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

