const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { requireAdmin, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

async function handleLogin(req, res) {
  try {
    const rawIdentifier = req.body.email || req.body.username || '';
    const password = req.body.password || '';

    if (!rawIdentifier.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const email = String(rawIdentifier).toLowerCase().trim();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@eventora.com').toLowerCase().trim();
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await Admin.findOne({ email });

    // Fallback: Check if credentials match configured environment variables
    const matchesEnv = email === envAdminEmail && password === envAdminPassword;

    if (!admin && !matchesEnv) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (admin) {
      const isMatch = await admin.comparePassword(password);
      if (!isMatch && !matchesEnv) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } else if (matchesEnv) {
      // Auto-create in MongoDB if valid env credentials were provided
      try {
        const hashedPassword = await Admin.hashPassword(envAdminPassword);
        admin = await Admin.create({
          email: envAdminEmail,
          password: hashedPassword,
          name: process.env.ADMIN_NAME || 'Eventora Admin',
          role: 'admin',
        });
      } catch (createErr) {
        // If race condition or create fails, create temporary admin object
        admin = {
          _id: 'admin-env',
          email: envAdminEmail,
          name: process.env.ADMIN_NAME || 'Eventora Admin',
          role: 'admin',
        };
      }
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        name: admin.name || 'Admin',
        role: admin.role || 'admin',
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name || 'Admin',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
}

function handleVerify(req, res) {
  res.json({
    valid: true,
    admin: req.admin,
  });
}

// Support both /login and /admin/login under whatever route prefix is mounted
router.post('/login', handleLogin);
router.post('/admin/login', handleLogin);

router.get('/verify', requireAdmin, handleVerify);
router.get('/admin/verify', requireAdmin, handleVerify);

module.exports = router;
