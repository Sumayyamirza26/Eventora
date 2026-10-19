# 🎓 Eventora – College Event Hub

A full-stack web application for college campuses to manage events, track capacity, and handle student registrations — with a secure admin dashboard.

🔗 **[Live Demo](https://eventora-lilac-delta.vercel.app/)**

---

## ✨ Features

- **Search & Category Filters**: Search events in real-time by title or keyword and filter across Tech, Cultural, Sports, Workshop, Career, and Other categories with quick clear-filter actions.
- **Save to Favourites**: Bookmark events directly from event cards or details popups, persisted locally with a dedicated "My Favourites" view.
- **Registration Confirmation**: Polished post-registration confirmation panel displaying event title, date/time, venue, and attendee confirmation details.
- **Visual Seat Availability**: Real-time capacity tracker showing seats filled, seats remaining, percentage progress bar, "Few Seats Left" warnings, and "Sold Out" states.
- **Concurrency-Safe Registrations**: Backend validation with atomic/transaction checks to prevent duplicate entries and overbooking beyond event capacity.
- **Toast Notifications**: Reusable, consistent feedback system for actions, favourites, form validation, and admin operations.
- **Secure Admin Portal**: Protected dashboard for event CRUD and attendee management, featuring empty-by-default login fields, clear placeholders, and a show/hide password toggle.
- **Curated Brand Palette**: Built with the official Eventora design tokens — Deep Plum (`#292331`), Warm Porcelain (`#F7F5F0`), Pure White (`#FFFFFF`), Muted Violet (`#625078`), Soft Citron (`#D6E59A`), and Misty Lilac (`#E7E2E9`).

---

## 🎨 Brand Colour Palette

| Token | Hex | Role |
| :--- | :--- | :--- |
| **Deep Plum** | `#292331` | Primary brand colour, navigation, headings, primary buttons |
| **Warm Porcelain** | `#F7F5F0` | Main application background |
| **Pure White** | `#FFFFFF` | Event cards, dialog surfaces, form containers |
| **Muted Violet** | `#625078` | Secondary actions, selected category filters, subtle text |
| **Soft Citron** | `#D6E59A` | Small highlights, active indicators, and favourite accents |
| **Misty Lilac** | `#E7E2E9` | Borders, dividers, and progress bar backgrounds |

Functional status colors: **Success** (`#356548`), **Warning** (`#875B18`), **Error** (`#A34235`), and **Info** (`#485A99`).

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
│   │   ├── components/   # Navbar, EventCard, EventForm, EventModal, ProtectedRoute, Toast
│   │   ├── pages/        # Home, Admin, AdminLogin
│   │   ├── useFavourites.js # Persistent favourites hook
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
