// Run with: npm run seed   (adds sample events if the database has none)

require('dotenv').config();

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Event = require('./models/Event');


const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=70`;
const inDays = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return new Date(d.toISOString().slice(0, 10));
};

const sampleEvents = [
  { title: 'CodeStorm Hackathon 2026', category: 'Tech', date: inDays(7), time: '09:00 AM', venue: 'Innovation Lab, Block C', capacity: 120,
    description: 'A 24-hour hackathon where teams build real products around campus problems. Mentors, snacks and prizes included.',
    imageUrl: img('photo-1504384308090-c894fdcc538d') },
  { title: 'Annual Cultural Fest: Rangtarang', category: 'Cultural', date: inDays(14), time: '05:00 PM', venue: 'Main Auditorium', capacity: 300,
    description: 'An evening of music, dance and drama performed by students. Come and cheer for your department!',
    imageUrl: img('photo-1459749411175-04bf5292ceea') },
  { title: 'Intro to Web Development Workshop', category: 'Workshop', date: inDays(10), time: '11:00 AM', venue: 'Computer Lab 2', capacity: 40,
    description: 'Hands-on session covering HTML, CSS and JavaScript basics. Bring your laptop and build your first webpage.',
    imageUrl: img('photo-1531482615713-2afd69097998') },
  { title: 'Campus Placement Prep Talk', category: 'Career', date: inDays(5), time: '02:00 PM', venue: 'Seminar Hall', capacity: 150,
    description: 'Alumni from top companies share resume tips, interview strategies and what recruiters really look for.',
    imageUrl: img('photo-1540575467063-178a50c2df87') },
  { title: 'Inter-Department Sports Meet', category: 'Sports', date: inDays(21), time: '08:00 AM', venue: 'College Ground', capacity: 200,
    description: 'Cricket, football, kabaddi and relay races. Represent your department and win the overall trophy.',
    imageUrl: img('photo-1517048676732-d65bc937f952') },
  { title: 'Open Mic Night', category: 'Cultural', date: inDays(3), time: '06:30 PM', venue: 'Student Cafe Lawn', capacity: 60,
    description: 'Sing, recite poetry, do stand-up or just enjoy the show. All talents welcome.',
    imageUrl: img('photo-1501281668745-f7f57925c3b4') },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventora');
    const count = await Event.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} event(s). Seed skipped.`);
    } else {
      await Event.insertMany(sampleEvents);
      console.log(`Added ${sampleEvents.length} sample events.`);
    }
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
