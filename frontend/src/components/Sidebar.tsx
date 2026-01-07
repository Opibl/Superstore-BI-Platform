import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslate } from '../i18n/useTranslate'
import { useState } from 'react'

type User = {
  role?: 'admin' | 'user'
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { t } = useTranslate()
  const user: User = JSON.parse(localStorage.getItem('user') || '{}')
  const [isOpen, setIsOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded ${
      isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
    }`

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-10 flex items-center justify-between  bg-gray-900 text-white px-4">
        <span className="font-bold">{t('dashboard.title')}</span>
        <button onClick={() => setIsOpen(true)} aria-label="Open menu">
          ☰
        </button>
      </div>

      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-50 top-0 left-0
          w-64 bg-gray-900 text-white min-h-screen
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-6 text-xl font-bold border-b border-gray-700 flex justify-between items-center">
          {t('dashboard.title')}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/dashboard" className={linkClass}>
            {t('sidebar.dashboard')}
          </NavLink>

          <NavLink to="/analytics" className={linkClass}>
            {t('sidebar.analytics')}
          </NavLink>

          {user.role === 'admin' && (
            <>
              <NavLink to="/admin/create-user" className={linkClass}>
                {t('sidebar.createUser') ?? 'Crear usuario'}
              </NavLink>

              <NavLink to="/admin/users" className={linkClass}>
                {t('sidebar.users') ?? 'Usuarios'}
              </NavLink>
            </>
          )}

          <NavLink to="/reportes" className={linkClass}>
            {t('sidebar.reports')}
          </NavLink>

          <NavLink to="/configuracion" className={linkClass}>
            {t('sidebar.settings')}
          </NavLink>

          {/* Logout */}
          <button
            onClick={logout}
            className="mt-6 w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
          >
            {t('sidebar.logout')}
          </button>
        </nav>
      </aside>
    </>
  )
}
