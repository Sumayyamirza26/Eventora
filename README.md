# 🎓 Eventora – College Event Hub

A full-stack web application for college campuses to manage events, track capacity, handle student registrations, generate QR digital passes, and issue verified participation certificates — with a secure admin dashboard and dedicated student portal.

🔗 **[Live Demo](https://eventora-lilac-delta.vercel.app/)**

---

## ✨ Features

### 🎓 Student Portal & Lifecycle Experience
- **Student Signup & Login**: Secure student authentication with bcrypt password hashing, JWT sessions, and personal student account registration.
- **Student Dashboard**: Overview with personal Student Profile card, registered event metrics, confirmed seat count, and certificates earned.
- **My Registered Events**: View all events you have registered for with real-time status badges (`Confirmed`, `Waitlist #N`, `Checked In`, `Cancelled`).
- **Search & Filter Registered Events**: Filter registered events by status or search in real time by title, venue, or ticket code.
- **Cancel Event Registration**: Students can cancel their registration at any time, which automatically promotes the next waitlisted student and creates an allocation announcement.
- **Student Profile**: View and edit basic personal details (full name, phone number, department, year of study) while preserving your permanent Student Pass ID.
- **Registration Confirmation Notifications**: Real-time in-app notification center for registration confirmations, waitlist promotions, schedule modifications, and cancellations.
- **My Participation Certificates**: View official Participation Certificates on screen and download high-resolution A4 Landscape PDFs generated with Eventora's brand aesthetics.
- **QR Digital Passes**: Scannable digital pass generated for every registration with unique Student Pass ID (`STU-XXXX-XXXX`), unique Ticket Code (`EVT-XXXX-XXXX`), attendee info, and entrance verification.

### 🏛️ Campus Event Management & Administration
- **Search & Category Filters**: Search campus events in real-time by title or keyword and filter across Tech, Cultural, Sports, Workshop, Career, and Other categories.
- **Save to Favourites**: Bookmark events directly from event cards or details popups, persisted locally with a dedicated "My Favourites" view.
- **Registration Confirmation**: Polished post-registration confirmation panel displaying event title, date/time, venue, unique Ticket Code, and Student Pass ID.
- **Visual Seat Availability**: Real-time capacity tracker showing seats filled, seats remaining, percentage progress bar, "Few Seats Left" warnings, and "Sold Out" states.
- **Concurrency-Safe Registrations**: Backend validation with atomic/transaction checks to prevent duplicate entries and overbooking beyond event capacity.
- **Waitlist & Automatic Seat Allocation**: When an event is full, students join a numbered waitlist. When a confirmed seat is cancelled or removed, the first waitlisted student is automatically promoted and notified.
- **Event Communication Centre**: Admins broadcast Announcements, Schedule Changes, Venue Updates, and Cancellation Notices per event. Lifecycle events auto-post notices.
- **QR Check-in Station**: Admin verification tool to look up ticket codes or student pass IDs, confirm attendance, and prevent duplicate check-ins.
- **Toast Notifications**: Reusable, consistent feedback system for actions, favourites, form validation, and admin operations.
- **Secure Admin Portal**: Protected dashboard for event CRUD, attendee management, post-event statistics, and lifecycle tracking.
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
| **Frontend** | React 18, React Router v6, Tailwind CSS, Vite, jsPDF, qrcode |
| **Backend** | Node.js, Express 5, Mongoose, JWT, bcryptjs |
| **Database** | MongoDB Atlas / Local MongoDB |

---

## 📁 Project Structure

```
eventora/
├── backend/
│   ├── middleware/       # JWT auth middleware (requireAdmin, requireStudent, optionalAuth)
│   ├── models/           # Mongoose schemas (Event, Registration, Admin, Announcement, Student, Notification)
│   ├── routes/           # Express route handlers (auth, events, registrations, announcements, students)
│   ├── utils/            # Admin & demo student seed utilities
│   ├── server.js         # App entry point & route mounting
│   ├── seed.js           # Sample data seeder
│   └── .env              # Environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, EventCard, EventForm, EventModal, ProtectedRoute, Toast,
│   │   │                 # DigitalPass, InterestsModal, CommunicationCenterModal,
│   │   │                 # EventStatsModal, TicketVerifierModal, CertificateModal, StudentProfileModal
│   │   ├── pages/        # Home, Admin, AdminLogin, StudentAuth, StudentDashboard
│   │   ├── utils/        # Formatters, category colors, generateCertificate (jsPDF)
│   │   ├── useFavourites.js # Persistent favourites hook (localStorage)
│   │   ├── useInterests.js  # Student interest preferences hook (localStorage)
│   │   ├── api.js        # API client, auth & student storage helpers
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

Open [http://localhost:5173](http://localhost:5173):
- Visit `/student/login` for the student portal (Demo: `student@college.edu` / `student123`).
- Visit `/admin/login` for the admin portal (Demo: `admin@eventora.com` / `admin123`).

---

## 🔌 API Endpoints

### Student Portal APIs
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/students/signup` | Public | Register new student, returns unique Student ID & JWT |
| `POST` | `/api/students/login` | Public | Student login, returns JWT & profile |
| `GET` | `/api/students/profile` | Student | View current student profile |
| `PUT` | `/api/students/profile` | Student | Update basic student details (name, phone, dept, year) |
| `GET` | `/api/students/my-registrations` | Student | List student's registered events with status |
| `POST` | `/api/students/cancel-registration/:id` | Student | Cancel registration & auto-promote waitlisted student |
| `GET` | `/api/students/notifications` | Student | View in-app registration & event notices |
| `PUT` | `/api/students/notifications/read-all`| Student | Mark all notifications as read |
| `GET` | `/api/students/certificates` | Student | Retrieve verified participation certificates |

### Events & Registrations
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | List events (`?includeDrafts`, `?search`, `?category`, `?status`) |
| `GET` | `/api/events/:id` | Public | Get event details |
| `POST` | `/api/events` | Admin | Create event |
| `PUT` | `/api/events/:id` | Admin | Update event (triggers lifecycle announcements) |
| `DELETE` | `/api/events/:id` | Admin | Delete event |
| `POST` | `/api/registrations` | Public/Student| Register for an event (or join waitlist) |
| `GET` | `/api/registrations` | Admin | View all registrations |
| `GET` | `/api/registrations/ticket/:code` | Public | Look up registration by Ticket Code or Student ID |
| `GET` | `/api/registrations/stats/:eventId` | Admin | Post-event attendance statistics |
| `POST` | `/api/registrations/check-in` | Admin | Check in attendee by code (duplicate-safe) |
| `POST` | `/api/registrations/undo-check-in` | Admin | Revert a check-in |
| `DELETE` | `/api/registrations/:id` | Admin | Remove registration (auto-promotes waitlist) |

### Announcements & Admin Auth
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Admin login, returns JWT |
| `GET` | `/api/auth/verify` | Admin | Validate JWT session |
| `GET` | `/api/announcements` | Public | List announcements (`?event=<id>`) |
| `POST` | `/api/announcements` | Admin | Broadcast a new announcement |
| `DELETE` | `/api/announcements/:id` | Admin | Delete an announcement |

---

## 🔮 Future Improvements

- Email/SMS confirmation notifications via SendGrid/Twilio
- Export attendee & registration rosters to CSV/Excel
- Dark mode support

---

## 👩‍💻 Author

**Sumayya Mirza**
[GitHub](https://github.com/Sumayyamirza26) · [LinkedIn](https://www.linkedin.com/in/sumayya-mirza/)

---

## 📄 License

This project is open-source and available for educational purposes.
