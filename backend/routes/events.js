const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Announcement = require('../models/Announcement');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/events               -> all events (Public)
// GET /api/events?upcoming=true -> only events from today onwards (Public)
router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    // By default, public should not see 'Draft' events unless requested by admin
    if (!req.query.includeDrafts) {
      filter.status = { $ne: 'Draft' };
    }

    if (req.query.upcoming === 'true') {
      const todayUTC = new Date(new Date().toISOString().slice(0, 10));
      filter.date = { $gte: todayUTC };
    }
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }
    if (req.query.search && req.query.search.trim()) {
      filter.$or = [
        { title: { $regex: req.query.search.trim(), $options: 'i' } },
        { description: { $regex: req.query.search.trim(), $options: 'i' } },
        { venue: { $regex: req.query.search.trim(), $options: 'i' } },
      ];
    }
    const events = await Event.find(filter).sort({ date: 1 });

    // Count confirmed, waitlisted, and checkedIn for each event
    const counts = await Registration.aggregate([
      {
        $group: {
          _id: '$event',
          total: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $ne: ['$status', 'Waitlisted'] }, 1, 0] },
          },
          waitlisted: {
            $sum: { $cond: [{ $eq: ['$status', 'Waitlisted'] }, 1, 0] },
          },
          checkedIn: {
            $sum: { $cond: [{ $and: [{ $ne: ['$status', 'Waitlisted'] }, { $eq: ['$checkedIn', true] }] }, 1, 0] },
          },
        },
      },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = {
        registered: c.confirmed,
        waitlisted: c.waitlisted,
        checkedIn: c.checkedIn,
      };
    });

    res.json(
      events.map((e) => {
        const c = countMap[e._id.toString()] || { registered: 0, waitlisted: 0, checkedIn: 0 };
        return {
          ...e.toObject(),
          registered: c.registered,
          waitlisted: c.waitlisted,
          checkedIn: c.checkedIn,
        };
      })
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/events/stats/:id or /api/events/:id/stats (Admin only)
async function handleEventStats(req, res, next) {
  try {
    const eventId = req.params.id || req.params.eventId;
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
}

router.get('/stats/:id', requireAdmin, handleEventStats);
router.get('/:id/stats', requireAdmin, handleEventStats);

// GET /api/events/:id/announcements (Public)
router.get('/:id/announcements', async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ event: req.params.id })
      .populate('event', 'title date time venue status')
      .sort({ pinned: -1, createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    next(err);
  }
});

// POST /api/events/:id/announcements (Admin only)
router.post('/:id/announcements', requireAdmin, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Target event not found' });

    const { title, message, type, targetAudience, pinned } = req.body || {};
    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required' });

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

// GET /api/events/:id (Public)
router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const [confirmed, waitlisted, checkedIn] = await Promise.all([
      Registration.countDocuments({ event: event._id, status: { $ne: 'Waitlisted' } }),
      Registration.countDocuments({ event: event._id, status: 'Waitlisted' }),
      Registration.countDocuments({ event: event._id, status: { $ne: 'Waitlisted' }, checkedIn: true }),
    ]);

    res.json({
      ...event.toObject(),
      registered: confirmed,
      waitlisted,
      checkedIn,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/events (Admin only)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const event = await Event.create(req.body);

    // If created as Published, create an initial announcement
    if (event.status === 'Published') {
      await Announcement.create({
        event: event._id,
        title: 'Event Announced',
        message: `Registrations are now open for ${event.title}! Seats are limited to ${event.capacity}.`,
        type: 'Announcement',
      }).catch(() => {});
    }

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/:id (Admin only)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const previous = await Event.findById(req.params.id);
    if (!previous) return res.status(404).json({ message: 'Event not found' });

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Check for important lifecycle/schedule changes to broadcast in Communication Centre
    if (previous.status !== 'Cancelled' && event.status === 'Cancelled') {
      await Announcement.create({
        event: event._id,
        title: 'Event Cancelled',
        message: `Notice: "${event.title}" has been cancelled. ${event.cancellationReason || 'We apologize for any inconvenience caused.'}`,
        type: 'Cancellation',
        pinned: true,
      }).catch(() => {});
    } else if (previous.status === 'Draft' && event.status === 'Published') {
      await Announcement.create({
        event: event._id,
        title: 'Event Published',
        message: `"${event.title}" is officially live and accepting registrations.`,
        type: 'Announcement',
      }).catch(() => {});
    } else if (
      String(previous.date) !== String(event.date) ||
      previous.time !== event.time ||
      previous.venue !== event.venue
    ) {
      const changes = [];
      if (String(previous.date) !== String(event.date)) changes.push(`New Date`);
      if (previous.time !== event.time) changes.push(`New Time: ${event.time}`);
      if (previous.venue !== event.venue) changes.push(`New Venue: ${event.venue}`);

      await Announcement.create({
        event: event._id,
        title: 'Schedule / Venue Update',
        message: `Important update for "${event.title}": ${changes.join(', ')}. Please verify your digital pass.`,
        type: 'ScheduleChange',
        pinned: true,
      }).catch(() => {});
    }

    res.json(event);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/:id  (also removes its registrations & announcements) (Admin only)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await Registration.deleteMany({ event: event._id });
    await Announcement.deleteMany({ event: event._id });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
