Sarvam Analyser 📊
A comprehensive analytics, sales, and management dashboard built with the MERN stack (MongoDB, Express, React, Node.js).

Overivew
Sarvam Analyser is designed to provide role-based access for Master, Admin, and Worker users, allowing them to track sales, monitor branches, and review overall business performance.

Features ✨
Role-Based Authentication: Secure login supporting Master, Admin, and Worker roles.
Master Dashboard: Global overview of all branches, revenue tracking, and forecasting.
Admin Dashboard: Branch-specific analytics, team performance monitoring, and localized expenses.
Worker Dashboard: Personal sales targets, daily sales tracking, and inventory status.
Real-Time Data Visualization: Beautiful interactive charts using Chart.js.
Stock Management: Request, approve, or reject stock transfers in real-time.
Exporting: Download beautifully formatted PDF reports for accounting.
Tech Stack 🛠️
Frontend: React.js, Vite, Chart.js, Lucide-React, Axios
Backend: Node.js, Express.js
Database: MongoDB & Mongoose
Authentication: JSON Web Tokens (JWT) & bcrypt
Deployment: Vercel (Frontend), Render (Backend)
Running Locally 💻
1. Clone the repository
git clone https://github.com/KayalaDurgaEswar/Sarvam-Analyzer.git
cd Sarvam-Analyzer
2. Backend Setup
cd backend
npm install
Create a .env file in the backend directory and add:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
Start the backend server:

npm run dev
3. Frontend Setup
Open a new terminal window:

cd frontend
npm install
npm run dev
4. Default Login Credentials
You can seed the database with node backend/seed.js to use these credentials:

Master: master@sarvam.com
Admin: admin1@sarvam.com
Worker: worker1@sarvam.com
Password: password123 (for all accounts)
Production Deployment 🚀
Frontend is configured to be deployed on Vercel. Ensure you set the VITE_API_URL environment variable to your backend URL.
Backend is configured to be deployed on Render as a Web Service. Ensure you set the MONGO_URI and JWT_SECRET environment variables.
