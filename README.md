# 🎓 Eventora – College Event Hub

A full-stack web application for college campuses to manage events, track capacity, and handle student registrations — with a secure admin dashboard.

🔗 **[Live Demo](https://eventora-lilac-delta.vercel.app/)**

---

## ✨ Features

- Browse upcoming events with category badges, venue, schedule & real-time seat availability
- One-click student registration with duplicate & capacity validation
- Secure admin login with JWT authentication & bcrypt password hashing
- Protected admin dashboard to create, edit, delete events and manage registrations
- Auto-provisioned admin account from environment variables on first startup
- Sample data seeder to populate events across Tech, Cultural, Sports & Workshops

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Tailwind CSS, Vite |
| **Backend** | Node.js, Express 5, Mongoose, JWT, bcryptjs |
| **Database** | MongoDB (Local or Atlas) |

---

## 📁 Project Structure

```
eventora/
├── backend/
│   ├── middleware/       # JWT auth middleware
│   ├── models/           # Mongoose schemas (Event, Registration, Admin)
│   ├── routes/           # Express route handlers (auth, events, registrations)
│   ├── utils/            # Admin seed utility
│   ├── server.js         # App entry point
│   ├── seed.js           # Sample data seeder
│   └── .env              # Environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, EventCard, EventForm, EventModal, ProtectedRoute
│   │   ├── pages/        # Home, Admin, AdminLogin
│   │   ├── api.js        # API client & auth helpers
│   │   ├── App.jsx       # Root component with routing
│   │   └── main.jsx      # Entry point
│   ├── vercel.json       # SPA rewrite rules
│   └── vite.config.js    # Dev server & proxy config
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas cluster

### 1. Clone the repository

```bash
git clone https://github.com/Sumayyamirza26/Eventora.git
cd Eventora
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eventora
JWT_SECRET=your_secret_key
ADMIN_EMAIL=admin@eventora.com
ADMIN_PASSWORD=admin123
CLIENT_URL=http://localhost:5173
```

> For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

```bash
npm run seed   # (optional) load sample events
npm start      # starts server on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev    # starts app on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) and visit `/admin/login` to access the admin portal.

---

## 🔌 API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Admin login, returns JWT |
| `GET` | `/api/auth/verify` | Admin | Validate JWT session |
| `GET` | `/api/events` | Public | List all events |
| `GET` | `/api/events/:id` | Public | Get event details |
| `POST` | `/api/events` | Admin | Create event |
| `PUT` | `/api/events/:id` | Admin | Update event |
| `DELETE` | `/api/events/:id` | Admin | Delete event |
| `POST` | `/api/registrations` | Public | Register for an event |
| `GET` | `/api/registrations` | Admin | View all registrations |
| `DELETE` | `/api/registrations/:id` | Admin | Remove a registration |

---

## 🔮 Future Improvements

- Email confirmation on registration
- Event search & category filters
- Student login & registration history
- Export registrations to CSV
- Dark mode support

---

## 👩‍💻 Author

**Sumayya Mirza**
[GitHub](https://github.com/Sumayyamirza26) · [LinkedIn](https://www.linkedin.com/in/sumayya-mirza/)

---

## 📄 License

This project is open-source and available for educational purposes.
