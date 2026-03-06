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
import OutletPage from './pages/outlet/OutletPage'
import MultiHargaPage from './pages/price/MultiHargaPage'
import ProductDetailPage from './pages/product/ProductDetailPage'
import PromoDetailPage from './pages/promo/PromoDetailPage'
import VariantDetailPage from './pages/variant/VariantDetailPage'
import OutletDetailPage from './pages/outlet/OutletDetailPage'
import ProductFormPage from './pages/product/ProductFormPage'
import CategoryFormPage from './pages/category/CategoryFormPage'
import BrandFormPage from './pages/brand/BrandFormPage'
import VariantFormPage from './pages/variant/VariantFormPage'
import OutletFormPage from './pages/outlet/OutletFormPage'
import UnitFormPage from './pages/unit/UnitFormPage'
import PriceCategoryFormPage from './pages/price/PriceCategoryFormPage'



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
      <Route path="/outlets" element={<PrivateRoute><OutletPage /></PrivateRoute>} />
      <Route path="/multi-harga" element={<PrivateRoute><MultiHargaPage /></PrivateRoute>} />
      <Route path="/products/:id" element={<PrivateRoute><ProductDetailPage /></PrivateRoute>} />
      <Route path="/promos/:id" element={<PrivateRoute><PromoDetailPage /></PrivateRoute>} />
      <Route path="/variants/:id" element={<PrivateRoute><VariantDetailPage /></PrivateRoute>} />
      <Route path="/outlets/:id" element={<PrivateRoute><OutletDetailPage /></PrivateRoute>} />
      <Route path="/products/add" element={<PrivateRoute><ProductFormPage /></PrivateRoute>} />
      <Route path="/products/:id/edit" element={<PrivateRoute><ProductFormPage /></PrivateRoute>} />
      <Route path="/categories/add" element={<PrivateRoute><CategoryFormPage /></PrivateRoute>} />
      <Route path="/categories/:id/edit" element={<PrivateRoute><CategoryFormPage /></PrivateRoute>} />
      <Route path="/brands/add" element={<PrivateRoute><BrandFormPage /></PrivateRoute>} />
      <Route path="/brands/:id/edit" element={<PrivateRoute><BrandFormPage /></PrivateRoute>} />
      <Route path="/variants/add" element={<PrivateRoute><VariantFormPage /></PrivateRoute>} />
      <Route path="/variants/:id/edit" element={<PrivateRoute><VariantFormPage /></PrivateRoute>} />
      <Route path="/outlets/add" element={<PrivateRoute><OutletFormPage /></PrivateRoute>} />
      <Route path="/outlets/:id/edit" element={<PrivateRoute><OutletFormPage /></PrivateRoute>} />
      <Route path="/units/add" element={<PrivateRoute><UnitFormPage /></PrivateRoute>} />
      <Route path="/units/:id/edit" element={<PrivateRoute><UnitFormPage /></PrivateRoute>} />
      <Route path="/price-categories/add" element={<PrivateRoute><PriceCategoryFormPage /></PrivateRoute>} />
      <Route path="/price-categories/:id/edit" element={<PrivateRoute><PriceCategoryFormPage /></PrivateRoute>} />
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