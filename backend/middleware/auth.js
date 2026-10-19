require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eventora-super-secret-jwt-key';

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access denied. No admin authorization token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        message: 'Access forbidden. Admin role required.',
      });
    }

    req.admin = decoded;
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      message: 'Invalid authorization token. Please log in again.',
    });
  }
}

function requireStudent(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access denied. Please log in as a student.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'student') {
      return res.status(403).json({
        message: 'Access forbidden. Student role required.',
      });
    }

    req.student = decoded;
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      message: 'Invalid authorization token. Please log in again.',
    });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    if (decoded.role === 'admin') req.admin = decoded;
    if (decoded.role === 'student') req.student = decoded;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

module.exports = { requireAdmin, requireStudent, optionalAuth, JWT_SECRET };
