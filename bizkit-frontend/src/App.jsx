import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import CategoryPage from './pages/category/CategoryPage'
import BrandPage from './pages/brand/BrandPage'
import UnitPage from './pages/unit/UnitPage'
import VariantPage from './pages/variant/VariantPage'
import ProductPage from './pages/product/ProductPage'
import UserPage from './pages/user/UserPage'
import RolePage from './pages/role/RolePage'
import PaymentMethodPage from './pages/payment/PaymentMethodPage'
import PromoPage from './pages/promo/PromoPage'
import DailyReportPage from './pages/report/DailyReportPage'
import SalesReportPage from './pages/report/SalesReportPage'
import SettingPage from './pages/setting/SettingPage'
import AttendanceReportPage from './pages/report/AttendanceReportPage'
import ShiftReportPage from './pages/report/ShiftReportPage'
import TrendReportPage from './pages/report/TrendReportPage'

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  )
  return token ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  )
  return !token ? children : <Navigate to="/dashboard" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/categories" element={<PrivateRoute><CategoryPage /></PrivateRoute>} />
      <Route path="/brands" element={<PrivateRoute><BrandPage /></PrivateRoute>} />
      <Route path="/units" element={<PrivateRoute><UnitPage /></PrivateRoute>} />
      <Route path="/variants" element={<PrivateRoute><VariantPage /></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><ProductPage /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><UserPage /></PrivateRoute>} />
      <Route path="/roles" element={<PrivateRoute><RolePage /></PrivateRoute>} />
      <Route path="/payment-methods" element={<PrivateRoute><PaymentMethodPage /></PrivateRoute>} />
      <Route path="/promos" element={<PrivateRoute><PromoPage /></PrivateRoute>} />
      <Route path="/reports/daily" element={<PrivateRoute><DailyReportPage /></PrivateRoute>} />
      <Route path="/reports/sales" element={<PrivateRoute><SalesReportPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingPage /></PrivateRoute>} />
      <Route path="/reports/attendance" element={<PrivateRoute><AttendanceReportPage /></PrivateRoute>} />
      <Route path="/reports/shift" element={<PrivateRoute><ShiftReportPage /></PrivateRoute>} />
      <Route path="/reports/trend" element={<PrivateRoute><TrendReportPage /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}