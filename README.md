# Eventora – College Event Hub

Eventora is a full-stack web application designed for college campuses to streamline event discovery, capacity tracking, and student registrations with an administrative dashboard for event management.

---

## ✨ Key Features

- **Event Discovery** — Browse upcoming events with category badges, schedules, venues, and real-time seat availability.
- **Student Registration** — Easy registration modal with validation (name, email, phone, department, year).
- **Duplicate & Capacity Control** — Enforces event capacity limits and prevents duplicate registrations per student email.
- **Admin Dashboard (`/admin`)** — Manage events (create, edit, delete) and view or cancel student registrations.
- **Sample Data Seeder** — Quickly populate the database with sample events across Tech, Cultural, Sports, and Workshops.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router v6, Tailwind CSS, Vite
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB (Local or MongoDB Atlas)

---

## 🚀 Installation & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [MongoDB](https://www.mongodb.com/) (Local service or MongoDB Atlas cluster)

### 2. Run Backend
```bash
cd backend
npm install
npm run seed     # optional: load sample events
npm start        # runs on http://localhost:5000
```

*Configure `backend/.env`:*
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eventora
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev      # runs on http://localhost:5173
```

---

## 👩‍💻 Authors

**Sumayya Mirza**  
[GitHub](https://github.com/Sumayyamirza26) | [LinkedIn](https://www.linkedin.com/in/sumayya-mirza/)

---

## 📄 License

This project is open-source and available for educational purposes.
