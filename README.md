# Sarvam Analyser 📊

A comprehensive, production-ready enterprise analytics, sales, and multi-branch management dashboard engineered using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). 

Designed with a SaaS architecture, Sarvam Analyser provides businesses with granular control over multi-location operations, inventory logistical workflows, and real-time financial tracking.

---

## 🚀 Live Demo & Visuals

* **Frontend Deployment:** [Paste your Vercel Link Here - e.g., https://sarvam-analyzer.vercel.app]
* **Backend API Gateway:** [Paste your Render Link Here - e.g., https://sarvam-analyzer.onrender.com]

### Application Preview
| Authentication & Role Gateway | Interactive Analytics Dashboard | Stock Logistical Management |
| :---: | :---: | :---: |
| *[Drop Login Screenshot Here]* | *[Drop Dashboard/Charts Screenshot Here]* | *[Drop Stock Transfer Table Screenshot Here]* |

---

## ✨ Core Architecture & Features

### 🔐 1. Granular Role-Based Access Control (RBAC)
Secured via state-of-the-art authentication mechanisms (**JSON Web Tokens & bcrypt password hashing**), separating operations into three distinct data views:
* **Master View:** High-level corporate overview. Global revenue tracking across all active branches, macro-financial forecasting, and high-level cross-border trends.
* **Admin View:** Micro-management dashboard localized to specific branches. Enables real-time team performance audits, tracking of operational expenditure (OpEx), and region-specific stock control.
* **Worker View:** Focused performance interface displaying individualized sales targets, daily transactional logs, and localized inventory updates.

### 📉 2. Real-Time Data Visualization & Analytics
* Integrated **Chart.js** to map complex transactional datasets into fluid, interactive time-series and categorical charts.
* Optimized computation of key business metrics (Gross Revenue, Dynamic Net Margins, Operational Overhead) on the Express backend before transmitting compact JSON payloads to the frontend.

### 📦 3. Live Logistical Stock Management
* A state-driven internal supply-chain simulator allowing admins and workers to safely request, approve, or reject inventory transfers between distinct branch locations to eliminate logistical bottlenecks.

### 📑 4. Automated Financial Reporting
* Built-in server/client-side data rendering layer enabling users to export beautifully structured, client-ready **PDF reports** directly from the UI for external accounting or auditory compliance.

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

Follow these steps to run a local instance of Sarvam Analyser for evaluation or code audit.

### 1. Environment Cloning
```bash
git clone [https://github.com/KayalaDurgaEswar/Sarvam-Analyzer.git](https://github.com/KayalaDurgaEswar/Sarvam-Analyzer.git)
cd Sarvam-Analyzer
