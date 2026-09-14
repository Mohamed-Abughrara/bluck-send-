# ✉️ BulkSend - Personal Email Campaign Platform

A modern, full-stack personal bulk emailer and campaign management system. BulkSend features a high-performance Next.js dashboard and a dedicated Node.js/Express API backend with queue processing, CSV recipient importing, template variable replacement, live sending telemetry, and AES-256 encrypted SMTP configuration.

---

## 🌟 Key Features

- **⚡ Interactive Campaign Dashboard**: Real-time campaign tracking, email sending stats, open rates, and recipient counts.
- **✉️ Dynamic Templating Engine**: Support for personalizing emails with merge tags like `{{first_name}}`, `{{company}}`, etc.
- **👥 Recipient Management**: Paginated recipient manager with tag filtering, custom fields, and bulk CSV file imports.
- **🔐 Encrypted SMTP Configuration**: Secure SMTP setup with AES-256-GCM password encryption and connection testing.
- **🚀 Asynchronous Send Engine**: Sequential background send queue with rate limiting, safety delays, and live status progress.
- **📊 Real-time Campaign Telemetry**: Live sending status viewer per recipient with retry metrics and progress indicators.

---

## 📂 Project Architecture & Monorepo Structure

```
bluksend/
├── bulk-send/                  # Frontend Next.js 15 Application
│   ├── app/                    # Next.js App Router (Dashboard, Campaigns, Recipients, Settings)
│   ├── components/             # Reusable UI components (Sidebar, Badges, Modals)
│   ├── data/                   # Mock data & state adapters
│   └── public/                 # Static assets & UI mockups
│
├── bulk-send-api/              # Backend Node.js & Express REST API
│   ├── server.js               # Express application entry point
│   ├── data/                   # Lowdb JSON persistence layer (`db.json`)
│   └── src/
│       ├── controllers/        # Request handlers (Auth, Campaigns, Recipients, Settings)
│       ├── middleware/         # JWT Auth, Input Validators, Error Handling
│       ├── routes/             # API Router definitions
│       └── services/           # Email Service, Send Queue, Crypto AES-256
│
├── assets/                     # Design specs, diagrams & UI screenshots
└── README.md                   # Workspace Documentation
```

---

## 🛠️ Tech Stack

### Frontend (`bulk-send`)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons & UI**: Lucide React / Heroicons

### Backend (`bulk-send-api`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Lowdb (Lightweight JSON file DB)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt
- **Email Delivery**: Nodemailer + SMTP integration
- **Security**: AES-256-GCM encryption for stored SMTP credentials

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn

---

### 1. Setup & Run Backend API (`bulk-send-api`)

```bash
# Navigate to API directory
cd bulk-send-api

# Install dependencies
npm install

# Start development API server (runs on http://localhost:4000)
npm start
```

*The API server will listen on `http://localhost:4000/api`.*

---

### 2. Setup & Run Frontend Application (`bulk-send`)

```bash
# Navigate to frontend directory
cd bulk-send

# Install dependencies
npm install

# Start Next.js dev server (runs on http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to launch the BulkSend Dashboard.

---

## 📡 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | API server health check |
| `POST` | `/api/auth/register` | Register new account |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT |
| `GET` | `/api/recipients` | List & filter recipients |
| `POST` | `/api/recipients/bulk` | Bulk import recipients via CSV upload |
| `GET` | `/api/settings` | Get user SMTP & compliance settings |
| `POST` | `/api/settings/smtp/test` | Test SMTP credentials via Nodemailer |
| `GET` | `/api/campaigns` | List all campaigns |
| `POST` | `/api/campaigns` | Create new email campaign draft |
| `POST` | `/api/campaigns/:id/send` | Trigger background queue delivery |
| `GET` | `/api/campaigns/:id/status` | Get live delivery telemetry & logs |

---

## 🔒 Security & Best Practices

- **SMTP Password Safety**: Passwords stored in `data/db.json` are encrypted using AES-256-GCM key derivation.
- **Rate Limiting & Delays**: Configurable delays between outgoing emails to prevent domain blacklisting.
- **Masked Data**: Sensitive fields in API responses are masked before reaching client dashboards.

---

## 📝 License

This project is licensed under the MIT License.
