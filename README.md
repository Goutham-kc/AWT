# Academica Exchange (Student Rental Hub)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose%208-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime%20Chat-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Academica Exchange** is a full-stack peer-to-peer (P2P) campus rental marketplace exclusively for verified college students (**`@tkmce.ac.in`**). It enables students to rent, borrow, and share essential campus equipment—including textbooks, scientific calculators, mini-drafters, bicycles, and dorm utilities—within a secure, high-trust community.

---

## Table of Contents

- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Environment Variables](#environment-variables)
- [Getting Started Locally](#getting-started-locally)
- [API Endpoints Reference](#api-endpoints-reference)
- [Real-Time Messaging System](#real-time-messaging-system)
- [Email Verification Architecture](#email-verification-architecture)
- [Deployment (Render)](#deployment-render)
- [License](#license)

---

## Key Features

- **College Domain Verification:** Registration is strictly restricted to `@tkmce.ac.in` email addresses with real-time 6-digit OTP email verification via Brevo HTTPS API.
- **Dynamic Marketplace & Search:** Filter campus equipment by category (`textbooks`, `electronics`, `cycles`, `furniture`, `utilities`), keyword search, and price range in Indian Rupees (`₹`).
- **Rental Duration & Deposit Calculator:** Real-time calculation of daily rental rates (`₹/day`), refundable security deposits, and campus service fees.
- **Dual-Layer Real-Time Messaging:** Integrated messaging with real-time WebSockets (`Socket.IO`) and automated HTTP REST fallbacks. Includes rate negotiation and physical pickup handoff meetup proposals.
- **Listing Management:** Verified students can list items with photos, condition ratings, daily rates, and security deposit amounts.
- **Cart & Reservation Workflow:** Multi-item cart supporting date collision prevention, booking requests, and checkout summary.
- **Campus Referral Program:** Students receive ₹50 referral credits upon inviting verified classmates, redeemable against rental costs.
- **Responsive Portal Modals & Navigation:** Tailwind CSS v4 UI with mobile drawer navigation, active route highlighting, and React Portals (`createPortal`) for non-blocking dialogs.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend (React 19 + Vite + Tailwind v4)"]
        UI[SPA Pages / Router]
        SocketClient[Socket.IO Client]
        AppContext[App State & Auth Context]
    end

    subgraph Server["Backend Server (Node.js + Express)"]
        REST[Express REST API]
        SocketServer[Socket.IO Gateway]
        AuthMW[JWT Auth Middleware]
    end

    subgraph Storage["Database & Cloud Services"]
        MongoDB[(MongoDB Atlas)]
        BrevoAPI[Brevo HTTPS API / SMTP]
    end

    UI -->|HTTP Requests| REST
    SocketClient <-->|Bi-directional Events| SocketServer
    AppContext -->|JWT Token| AuthMW
    AuthMW --> REST
    REST -->|Mongoose Queries| MongoDB
    REST -->|Dispatch OTP (Port 443)| BrevoAPI
    SocketServer -->|Persist Chats| MongoDB
```

---

## Tech Stack

### Frontend
- **Framework:** React 19 (Hooks, Context API, React Portals)
- **Bundler:** Vite 8
- **Routing:** React Router DOM 7
- **Styling:** Tailwind CSS v4 & PostCSS
- **Icons:** Material Symbols & Lucide React
- **Real-Time Client:** Socket.IO Client 4.8

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 4.19
- **Database & ODM:** MongoDB Atlas & Mongoose 8.3
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs password hashing
- **Real-Time Gateway:** Socket.IO 4.7
- **Email Delivery:** Brevo HTTPS REST API (Port 443) with Nodemailer SMTP fallback

---

## Project Directory Structure

```text
AWT/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB Atlas connection setup
│   │   └── seed.js            # Initial TKMCE equipment pool seeder
│   ├── middleware/
│   │   └── auth.js            # JWT verification & route protection
│   ├── models/
│   │   ├── Booking.js         # Rental reservation schema
│   │   ├── Conversation.js    # Chat thread schema (participants & listing refs)
│   │   ├── Listing.js         # Equipment items schema
│   │   ├── Message.js         # Chat message & proposal schema
│   │   └── User.js            # Student profile & referral schema
│   ├── routes/
│   │   ├── auth.js            # Sign up, OTP verify, login, resend OTP
│   │   ├── bookings.js        # Rental checkout & booking lifecycle
│   │   ├── chats.js           # Conversation threads & message REST API
│   │   ├── listings.js        # Item CRUD & filter endpoints
│   │   └── referrals.js       # Referral statistics & credit balances
│   ├── sockets/
│   │   └── chatHandler.js     # Socket.IO room events & message broadcasts
│   ├── utils/
│   │   └── emailService.js    # Brevo HTTPS API & Nodemailer integration
│   ├── package.json
│   └── server.js              # Express app & HTTP/Socket server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx     # Navigation, active routes, and Login modal portal
│   │   ├── context/
│   │   │   └── AppContext.jsx # Global auth, user session, and cart state
│   │   ├── pages/
│   │   │   ├── Cart.jsx       # Multi-item cart & reservation summary
│   │   │   ├── Chat.jsx       # Real-time message thread & meetup proposal UI
│   │   │   ├── CreateListing.jsx # Form to list items for rent
│   │   │   ├── Landing.jsx    # Hero, trust badges, and category previews
│   │   │   ├── ListingDetail.jsx # Item media, specifications, and date picker
│   │   │   ├── Marketplace.jsx# Product search & category filters
│   │   │   ├── Notifications.jsx # Campus notifications feed
│   │   │   ├── Referrals.jsx  # Referral code sharing & credit tracking
│   │   │   ├── SignUp.jsx     # Student registration form
│   │   │   └── Verification.jsx # 6-digit OTP entry screen
│   │   ├── App.jsx            # React route definitions
│   │   ├── index.css          # Tailwind CSS v4 styling & layout tokens
│   │   └── main.jsx           # React DOM root entry point
│   ├── package.json
│   └── vite.config.js
│
├── package.json               # Root build orchestration
└── README.md
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/student_rental?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here

# Brevo (Sendinblue) HTTPS API (Recommended for Universal Delivery to @tkmce.ac.in)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BREVO_SENDER_EMAIL=your-verified-brevo-sender@gmail.com

# Optional SMTP Fallbacks
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

| Variable | Description | Required |
| :--- | :--- | :--- |
| `PORT` | Backend server port (defaults to 5000) | No |
| `MONGO_URI` | MongoDB connection string (Atlas or local) | **Yes** |
| `JWT_SECRET` | Secret key used to sign JWT auth tokens | **Yes** |
| `BREVO_API_KEY` | Brevo API key for sending OTP emails over Port 443 | **Yes** (in production) |
| `BREVO_SENDER_EMAIL` | Verified sender email configured in your Brevo account | **Yes** (in production) |

---

## Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/) cluster or local MongoDB instance

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Goutham-kc/AWT.git
cd AWT

# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

### 2. Configure Environment Variables
Copy or create `backend/.env` with your MongoDB connection string and API keys.

### 3. Build Frontend & Run Server
```bash
# Build the production frontend bundle
npm run build-frontend

# Start the full-stack server
npm start --prefix backend
```

Access the application in your browser:
- **Local Application:** `http://localhost:5000`
- **Initial Seeded Admin/Store:** `campus.store@tkmce.ac.in` (Password: `tkmce123`)

---

## API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | Register new student (`@tkmce.ac.in` only) | Public |
| `POST` | `/verify-otp` | Verify 6-digit email OTP & activate account | Public |
| `POST` | `/resend-otp` | Resend fresh 6-digit OTP code to email | Public |
| `POST` | `/login` | Authenticate student and issue JWT token | Public |
| `GET`  | `/me` | Get current authenticated user profile | Private |

### Listings (`/api/listings`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET`  | `/` | Retrieve all listings (supports `category`, `campus`, `search`) | Public |
| `GET`  | `/:id` | Get single listing detail with lister profile | Public |
| `POST` | `/` | Create a new equipment listing | Private |
| `PUT`  | `/:id` | Update an existing listing | Private |
| `DELETE`| `/:id` | Delete a listing | Private |

### Bookings (`/api/bookings`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Submit a rental booking request | Private |
| `GET`  | `/my-bookings` | Get rental requests created by student | Private |
| `PUT`  | `/:id/status` | Approve, reject, or mark rental returned | Private |

### Chat & Messaging (`/api/chats`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET`  | `/conversations` | List conversation threads of current user | Private |
| `POST` | `/conversations` | Open or find conversation with a seller | Private |
| `GET`  | `/conversations/:id/messages` | Get message history in thread | Private |
| `POST` | `/conversations/:id/messages` | Send message via REST API & broadcast | Private |

---

## Real-Time Messaging System

The messaging architecture combines **Socket.IO** with an **Express REST fallback**:

1. **Dual Delivery:** Sending a message posts to `POST /api/chats/conversations/:id/messages`. The backend saves the document to MongoDB, updates the thread's last message, and broadcasts `new_message` to the Socket room. If WebSockets are reconnecting or blocked, the REST fallback ensures zero lost messages.
2. **Room Management:** When opening a thread, the client emits `join_conversation`. Sockets automatically route updates only to authorized thread participants.
3. **Structured Proposals:** Supports price negotiation (`price_proposal`) and physical pickup proposals (`meetup_proposal`), allowing peers to settle terms directly inside the chat window.

---

## Email Verification Architecture

```text
Student Enters Email (@tkmce.ac.in)
              │
              ▼
Backend generates 6-digit OTP (15-min expiry)
              │
              ├──► 1. Brevo HTTPS API (https://api.brevo.com/v3/smtp/email)
              │    - Uses standard Outbound HTTPS Port 443
              │    - Bypasses cloud host SMTP port restrictions
              │    - Delivers directly to @tkmce.ac.in inbox
              │
              └──► 2. Nodemailer SMTP Fallback
```

### Why Brevo HTTPS API?
Free-tier hosting providers (e.g., Render, Railway) block outbound SMTP ports (25, 465, 587) to prevent spam. The Brevo HTTPS API communicates via standard **Port 443**, guaranteeing reliable OTP delivery directly to student college inboxes without port blocking or DNS domain verification restrictions.

---

## Deployment (Render)

1. Connect your repository to [Render](https://render.com/).
2. Select **Web Service** with runtime **Node**.
3. **Build Command:**
   ```bash
   npm run build
   ```
4. **Start Command:**
   ```bash
   npm start
   ```
5. **Environment Variables:** Add `MONGO_URI`, `JWT_SECRET`, `BREVO_API_KEY`, and `BREVO_SENDER_EMAIL`.
6. Push to `main` branch to trigger automatic builds and zero-downtime deployment.

---

## License

This project was developed as part of the Academic Web Technology (AWT) curriculum for **TKM College of Engineering (TKMCE)**. Distributed under the **MIT License**.