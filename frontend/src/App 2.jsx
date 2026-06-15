import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

// Master pages
import MasterDashboard from './pages/master/MasterDashboard'
import BranchPerformance from './pages/master/BranchPerformance'
import GlobalProfit from './pages/master/GlobalProfit'
import UserManagement from './pages/master/UserManagement'
import ExpenseMonitoring from './pages/master/ExpenseMonitoring'
import TopProducts from './pages/master/TopProducts'
import InventoryOverview from './pages/master/InventoryOverview'
import Forecasting from './pages/master/Forecasting'
import ProfitMargins from './pages/master/ProfitMargins'
import Settings from './pages/master/Settings'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import BranchSales from './pages/admin/BranchSales'
import ProductManagement from './pages/admin/ProductManagement'
import BranchExpenses from './pages/admin/BranchExpenses'
import WorkerPerformance from './pages/admin/WorkerPerformance'
import BranchReports from './pages/admin/BranchReports'

// Worker pages
import WorkerDashboard from './pages/worker/WorkerDashboard'
import RecordSale from './pages/worker/RecordSale'
import StockCheck from './pages/worker/StockCheck'

import './styles/design.css'

function App() {
  return (
    <>
      <div className="app-background"></div>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Master Routes */}
        <Route path="/master" element={<ProtectedRoute allowedRoles={['master']}><MasterDashboard /></ProtectedRoute>} />
        <Route path="/master/branches" element={<ProtectedRoute allowedRoles={['master']}><BranchPerformance /></ProtectedRoute>} />
        <Route path="/master/profit" element={<ProtectedRoute allowedRoles={['master']}><GlobalProfit /></ProtectedRoute>} />
        <Route path="/master/users" element={<ProtectedRoute allowedRoles={['master']}><UserManagement /></ProtectedRoute>} />
        <Route path="/master/expenses" element={<ProtectedRoute allowedRoles={['master']}><ExpenseMonitoring /></ProtectedRoute>} />
        <Route path="/master/products" element={<ProtectedRoute allowedRoles={['master']}><TopProducts /></ProtectedRoute>} />
        <Route path="/master/inventory" element={<ProtectedRoute allowedRoles={['master']}><InventoryOverview /></ProtectedRoute>} />
        <Route path="/master/forecasting" element={<ProtectedRoute allowedRoles={['master']}><Forecasting /></ProtectedRoute>} />
        <Route path="/master/margins" element={<ProtectedRoute allowedRoles={['master']}><ProfitMargins /></ProtectedRoute>} />
        <Route path="/master/settings" element={<ProtectedRoute allowedRoles={['master']}><Settings /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/sales" element={<ProtectedRoute allowedRoles={['admin']}><BranchSales /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><ProductManagement /></ProtectedRoute>} />
        <Route path="/admin/expenses" element={<ProtectedRoute allowedRoles={['admin']}><BranchExpenses /></ProtectedRoute>} />
        <Route path="/admin/workers" element={<ProtectedRoute allowedRoles={['admin']}><WorkerPerformance /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><BranchReports /></ProtectedRoute>} />

        {/* Worker Routes */}
        <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/worker/sale" element={<ProtectedRoute allowedRoles={['worker']}><RecordSale /></ProtectedRoute>} />
        <Route path="/worker/stock" element={<ProtectedRoute allowedRoles={['worker']}><StockCheck /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
