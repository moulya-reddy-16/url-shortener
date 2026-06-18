# Minify - Premium URL Shortener & Analytics Cockpit

Minify is a modern, developer-grade link redirection and analytics dashboard built using the MERN stack (MongoDB, Express, React, Node). Featuring a stunning dark-mode/light-mode Glassmorphic interface, real-time geocoded analytics, password-protection gates, custom branding aliases, and downloadable QR codes, it serves as a robust platform for modern digital marketing and link instrumentation.

---

## 🌟 Key Features

- **Single & Bulk Shortening**: Shorten single URLs with advanced controls, or paste up to 10 URLs for instant bulk processing.
- **Custom Branding Aliases**: Customize short links with readable, memorable slugs instead of random hash values.
- **Advanced Security & Protection**:
  - **Password Gates**: Restrict access to sensitive links using high-security `bcryptjs` hashing.
  - **One-Time Self-Destruct**: Auto-expire links immediately after their first redirection.
  - **Expiration Timers**: Automatically deactivate links on specified calendar dates.
- **Automated QR Code Generator**: Generate high-resolution QR codes dynamically for every short link and download them as PNGs.
- **Geocoded Analytics Cockpit**:
  - Daily traffic performance trends (interactive SVG line charts).
  - Geographical metrics mapping visits to countries and cities (using IP geolocation APIs).
  - Device platform share (Mobile vs. Tablet vs. Desktop).
  - Browser distribution statistics.
  - Live activity streams showing the last 10 clicks in real time.
- **Dual Aurora Themes**: Premium "Sunrise Glass" (light mode) and "Cyber Galaxy" (dark mode) styling with fluid transitions.
- **Role-Based Moderation**: Admin dashboard providing overview of platform statistics, category distributions, and moderate-delete controls.

---

## 🛠️ Technology Stack

### Backend
* **Node.js** & **Express.js** (Modern ES Modules import architecture)
* **MongoDB** & **Mongoose** (Strict schema enforcement, indexing, and model tracking)
* **JWT (JSON Web Tokens)** & **Cookie-Parser** (HttpOnly cookies for secure session authentication)
* **Multer** (DiskStorage processing for profile image uploads)
* **Bcrypt.js** (Hashed credential encryption)

### Frontend
* **React 19** & **Vite 8** (Ultra-fast hot module replacement)
* **TailwindCSS v4** (Modern utility engine)
* **Framer Motion** (Subtle micro-animations, slide-ins, and layout-based page transits)
* **Lucide React** (Vector icons)
* **QRCode** (Dynamically drawing QR matrix data-URLs client-side)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on port `27017`)

---

### Step 1: Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify the environment variables in `.env` (already configured for local deployment):
   ```env
   PORT=5000
   DB_URL=mongodb://localhost:27017/urlDB
   SECRET_KEY=vghuisxcmanivsckasdgh
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

---

### Step 2: Frontend Setup
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser and head to: **`http://localhost:5173`**

---

## 🔒 Test Accounts & Review Details

To make your evaluation and review smooth, the platform includes the following preset mechanisms:

### 1. Auto-Seeded Admin Account
Logging in with the credentials below will auto-seed a system administrator account on the fly:
* **Email**: `admin@minify.click`
* **Password**: `admin123`
* *Once logged in, you will be directed to the Admin Moderation Dashboard.*

### 2. Mock Email Verification
When a user registers a new account, they are initially flagged as unverified (`isVerified: false`).
* For review convenience, Minify prints the **Mock Email Verification Link** in the backend server's terminal logs.
* In development mode, the link is also returned directly in the register API's HTTP response block.
* Clicking this link updates the user's status to `isVerified: true` and unlocks all system features.
