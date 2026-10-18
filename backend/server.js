require('dotenv').config();

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ensureDefaultAdmin } = require('./utils/seedAdmin');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
const corsOptions = process.env.CLIENT_URL
  ? {
      origin: process.env.CLIENT_URL.split(',').map((u) => u.trim()),
      credentials: true,
    }
  : undefined;

app.use(cors(corsOptions));
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

// Authentication routes (supporting /api/auth/*, /api/admin/*, and /api/login)
app.use('/api/auth', authRoutes);
app.use('/api/admin', authRoutes);
app.post('/api/login', (req, res, next) => authRoutes(req, res, next));
app.get('/api/verify', (req, res, next) => authRoutes(req, res, next));

// Application routes
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));

// Unknown API route handler
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Central error handler: turns database errors into friendly messages
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID' });
  if (err.code === 11000) {
    return res.status(409).json({ message: 'You are already registered for this event' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
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
