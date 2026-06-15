# Sarvam Analyser 📊

A comprehensive, production-ready enterprise analytics, sales, and multi-branch management dashboard engineered using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).

Designed with a SaaS architecture, Sarvam Analyser provides businesses with granular control over multi-location operations, operational transactional workflows, and real-time financial tracking.

---

## 🚀 Live Demo & Visuals

* **Frontend Deployment:** https://sarvam-analyzer-olive.vercel.app/
* **Backend API Gateway:** https://sarvam-analyzer-ywnv.onrender.com

### Application Preview
| Authentication & Role Gateway | Interactive Analytics Dashboard |
| :---: | :---: |
| <img width="1896" height="1018" alt="Authentication Gateway" src="https://github.com/user-attachments/assets/3e0fdf6c-ab3a-4451-91cc-b1b6b5f55391" /> | <img width="1882" height="1017" alt="Analytics Dashboard" src="https://github.com/user-attachments/assets/1239c7a6-370d-4c6f-96a2-d3ee41afde83" /> |

---

## ✨ Core Architecture & Features

### 🔐 1. Managed Enterprise Authentication & Role-Based Access Control (RBAC)
Engineered around a secure, **Enterprise-Provisioned Authentication Model** using **JSON Web Tokens (JWT) & bcrypt password hashing**. Public self-registration is disabled; access profiles are systematically provisioned across three distinct administrative tiers:
* **Master View:** High-level corporate overview — global revenue tracking across all active branches, macro-financial forecasting, and cross-branch trends.
* **Admin View:** Micro-management dashboard localized to specific branches — real-time team performance audits, OpEx tracking, and region-specific analytics.
* **Worker View:** Focused performance interface — individualized sales targets, daily transactional logs, and localized updates.

### 📉 2. Real-Time Data Visualization & Analytics
* Integrated **Chart.js** to map transactional datasets into fluid, interactive time-series and categorical charts.
* Key business metrics (Gross Revenue, Dynamic Net Margins, Operational Overhead) are computed on the Express backend before sending compact JSON payloads to the frontend.

### 📑 3. Automated Financial Reporting
* Built-in data rendering layer enabling export of structured, client-ready **PDF reports** directly from the UI for accounting or audit compliance.

---

## 🛠️ Technology Stack

| Layer | Technologies Utilized |
| --- | --- |
| **Frontend** | React.js, Vite, Chart.js, Lucide React icons, Axios (HTTP Client) |
| **Backend** | Node.js, Express.js (Modular REST API architecture) |
| **Database** | MongoDB, Mongoose ODM (Optimized schemas with indexing) |
| **Security** | JSON Web Tokens (JWT) for stateless sessions, Bcrypt for cryptographic hashing |
| **Deployment** | Vercel (Edge-optimized Frontend), Render (Cloud Web Service Backend) |

---

## 💻 Local Development & Installation

### 1. Environment Cloning
```bash
git clone https://github.com/Praneeth-376/sarvam_analyzer.git
cd sarvam_analyzer
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_secure_key
PORT=5001
```

```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Demo / Evaluation Access

For evaluation purposes, the project includes a seed script (`backend/seed.js`) that provisions sample accounts across all three role tiers (Master, Branch Admin, Worker) and two demo branches (Downtown HQ, Tech Park), demonstrating multi-branch data isolation.

To set up demo accounts on your own instance:
```bash
node backend/seed.js
```

This will create demo logins for each role tier with credentials defined in `seed.js`. **Do not use real/shared credentials in this file or commit `.env` to version control.**

> If you'd like recruiters to test the live deployment directly, consider creating one read-only "demo" account per role with a unique, non-guessable password set specifically for that purpose — and rotate it periodically — rather than publishing your real production credentials.

---

## 🚀 Production Infrastructure Config

* **Frontend CI/CD:** Native Vercel integration. Ensure `VITE_API_URL` points to your production backend gateway on Render.
* **Backend Cloud Cluster:** Configured for Render Web Services. Ensure `MONGO_URI` and `JWT_SECRET` are set as environment variables on the Render dashboard before deployment.
