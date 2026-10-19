require('dotenv').config();

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ensureDefaultAdmin } = require('./utils/seedAdmin');
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const registrationsRoutes = require('./routes/registrations');
const announcementsRoutes = require('./routes/announcements');
const studentsRoutes = require('./routes/students');

const app = express();

// Comprehensive CORS allowing all local and deployed clients (Vercel, Render, custom domains)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json());

// Normalize accidental duplicated /api/api/ prefixes from misconfigured frontend URLs
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.replace(/^\/api\/api\//, '/api/');
  }
  next();
});

// Root & Health check endpoints (useful for Render deployment pinging)
app.get('/', (req, res) => res.json({ status: 'ok', service: 'Eventora Backend API' }));
app.get('/api', (req, res) => res.json({ status: 'ok', service: 'Eventora Backend API' }));
app.get('/health', (req, res) => res.json({ status: 'healthy', uptime: process.uptime() }));

// ── Application Routes with /api prefix ───────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', authRoutes);
app.post('/api/login', (req, res, next) => authRoutes(req, res, next));
app.get('/api/verify', (req, res, next) => authRoutes(req, res, next));

app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/student', studentsRoutes);

// Direct stats aliases
app.use('/api/stats', (req, res, next) => {
  req.url = `/stats${req.url}`;
  registrationsRoutes(req, res, next);
});

// ── Application Routes without /api prefix (for proxy/direct flexibility) ─────
app.use('/auth', authRoutes);
app.use('/admin', authRoutes);
app.use('/events', eventsRoutes);
app.use('/registrations', registrationsRoutes);
app.use('/announcements', announcementsRoutes);
app.use('/students', studentsRoutes);
app.use('/student', studentsRoutes);

// Unknown route handler
app.use((req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler: turns database errors into friendly messages
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID' });
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with this information already exists' });
  }
  console.error(err);
  res.status(500).json({ message: err.message || 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventora';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await ensureDefaultAdmin();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
