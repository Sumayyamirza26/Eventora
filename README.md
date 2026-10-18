# Eventora – College Event Hub

Eventora is a full-stack web application designed for college campuses to streamline event discovery, capacity tracking, and student registrations with a secure administrative dashboard for event management.

---

## ✨ Key Features

- **Public Event Discovery** — Browse upcoming events with category badges, schedules, venues, and real-time seat availability.
- **Student Registration** — Easy registration modal with validation (name, email, phone, department, year).
- **Duplicate & Capacity Control** — Enforces event capacity limits and prevents duplicate registrations per student email.
- **Secure Admin Portal (`/admin/login`)** — Protected login for campus administrators utilizing JSON Web Tokens (JWT) and bcrypt password hashing.
- **Protected Admin Dashboard (`/admin`)** — Secured both on the frontend route and backend REST API to create, edit, and delete events, as well as manage registered attendees.
- **Automated Admin Provisioning** — Automatically initializes the initial admin account upon first startup using configured environment variables.
- **Sample Data Seeder** — Quickly populate the database with sample events across Tech, Cultural, Sports, and Workshops.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router v6, Tailwind CSS, Vite
- **Backend:** Node.js, Express, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`
- **Database:** MongoDB (Local or MongoDB Atlas)

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [MongoDB](https://www.mongodb.com/) (Local service running on `27017` or MongoDB Atlas cluster)

### 2. Configure Backend Environment
Create or edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eventora
JWT_SECRET=your_super_secret_jwt_key
ADMIN_EMAIL=admin@eventora.com
ADMIN_PASSWORD=admin123
CLIENT_URL=http://localhost:5173,http://localhost:3000
```
*(For MongoDB Atlas, replace `MONGO_URI` with your connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/eventora?retryWrites=true&w=majority`)*

### 3. Run Backend
```bash
cd backend
npm install
npm run seed     # optional: load sample events
npm start        # runs on http://localhost:5000
```

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev      # runs on http://localhost:5173
```

Visit [http://localhost:5173](http://localhost:5173).  
Access the admin portal by clicking **Admin** or visiting [http://localhost:5173/admin/login](http://localhost:5173/admin/login).

---

## 🔒 Protected API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | **Public** | Authenticates admin credentials and returns a JWT token |
| `GET` | `/api/auth/verify` | **Admin Only** | Validates the JWT token signature and session status |
| `GET` | `/api/events` | **Public** | List all upcoming events |
| `GET` | `/api/events/:id` | **Public** | Get specific event details |
| `POST` | `/api/events` | **Admin Only** | Create a new event |
| `PUT` | `/api/events/:id` | **Admin Only** | Update an existing event |
| `DELETE` | `/api/events/:id` | **Admin Only** | Delete an event and its registrations |
| `POST` | `/api/registrations` | **Public** | Register a student for an event |
| `GET` | `/api/registrations` | **Admin Only** | View registered students list |
| `DELETE` | `/api/registrations/:id` | **Admin Only** | Cancel/remove a student registration |

---

## ☁️ Deployment Instructions

### A. MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere, required for Render).
3. Under **Database Access**, create a database user with read/write privileges.
4. Copy your connection string (`mongodb+srv://...`).

### B. Render (Backend Deployment)
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com/) and click **New + > Web Service**.
3. Connect your repository.
4. Configure the service:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables in Render:
   - `PORT`: `5000`
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_random_secure_secret_key`
   - `ADMIN_EMAIL`: `your_chosen_admin_email@domain.com`
   - `ADMIN_PASSWORD`: `your_strong_admin_password`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
6. Click **Deploy Web Service** and copy your backend URL (e.g., `https://eventora-backend.onrender.com`).

### C. Vercel (Frontend Deployment)
1. Sign in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com` (your Render backend URL)
5. Click **Deploy**. Single-page routing (`/admin`, `/admin/login`) is automatically handled by the included [`vercel.json`](file:///c:/Users/Admin/Downloads/eventora/eventora/frontend/vercel.json).

---

## 👩‍💻 Authors

**Sumayya Mirza**  
[GitHub](https://github.com/Sumayyamirza26) | [LinkedIn](https://www.linkedin.com/in/sumayya-mirza/)

---

## 📄 License

This project is open-source and available for educational purposes.
