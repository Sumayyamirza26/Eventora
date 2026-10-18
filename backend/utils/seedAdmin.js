const Admin = require('../models/Admin');

async function ensureDefaultAdmin() {
  try {
    const email = (process.env.ADMIN_EMAIL || 'admin@eventora.com').toLowerCase().trim();
    const existingAdmin = await Admin.findOne({ email });

    if (!existingAdmin) {
      const plainPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await Admin.hashPassword(plainPassword);
      await Admin.create({
        email,
        password: hashedPassword,
        name: process.env.ADMIN_NAME || 'Eventora Admin',
        role: 'admin',
      });
      console.log(`Admin account initialized: ${email}`);
    }
  } catch (err) {
    console.error('Notice: Could not check/seed default admin account:', err.message);
  }
}

module.exports = { ensureDefaultAdmin };

