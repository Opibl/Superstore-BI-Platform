import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslate } from '../i18n/useTranslate'

type User = {
  role?: 'admin' | 'user'
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { t } = useTranslate()
  const user: User = JSON.parse(localStorage.getItem('user') || '{}')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        {t('dashboard.title')}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`
          }
        >
          {t('sidebar.dashboard')}
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`
          }
        >
          {t('sidebar.analytics')}
        </NavLink>

        {user.role === 'admin' && (
          <>
            <NavLink
              to="/admin/create-user"
              className={({ isActive }) =>
                `block px-4 py-2 rounded ${
                  isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`
              }
            >
              {t('sidebar.createUser') ?? 'Crear usuario'}
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `block px-4 py-2 rounded ${
                  isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`
              }
            >
              {t('sidebar.users') ?? 'Usuarios'}
            </NavLink>
          </>
        )}

        <NavLink
          to="/reportes"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`
          }
        >
          {t('sidebar.reports')}
        </NavLink>

        <NavLink
          to="/configuracion"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`
          }
        >
          {t('sidebar.settings')}
        </NavLink>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-6 w-full px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          {t('sidebar.logout')}
        </button>
      </nav>
    </aside>
  )
}
