import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './components/Login'
import Dashboard from './components/Dashboard'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

import AdminPanel from './components/AdminPanel'
import Settings from './components/Configuracion'
import Reportes from './components/Reportes'
import AnalyticsDashboard from './components/AnalyticsDashboard'

import { SettingsProvider } from './context/SettingsContext'
import Registrar from './components/registrar'

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          {/* =====================
              RUTA PÚBLICA
          ====================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/registrar" element={<Registrar />} />


          {/* =====================
              USUARIO LOGUEADO
          ====================== */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }

          />

          <Route
            path="/configuracion"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />

          <Route
            path="/reportes"
            element={
              <PrivateRoute>
                <Reportes />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <AnalyticsDashboard />
              </PrivateRoute>
            }
          />


          {/* =====================
              SOLO ADMIN
          ====================== */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

          {/* =====================
              CATCH ALL
          ====================== */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  )
}
