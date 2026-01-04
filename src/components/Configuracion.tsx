import Sidebar from './Sidebar'
import { useSettings } from '../context/SettingsContext'
import { useTranslate } from '../i18n/useTranslate'


export default function Ajustes() {
  const { settings, updateSettings } = useSettings()
  const { t } = useTranslate()

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <div className="flex-1 p-8 space-y-8 overflow-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {t('settings.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Apariencia */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            {t('settings.appearance')}
          </h2>

          <div className="flex items-center justify-between text-gray-700 dark:text-gray-200">
            <span>{t('settings.darkMode')}</span>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={() =>
                updateSettings({ darkMode: !settings.darkMode })
              }
            />
          </div>
        </section>

        {/* Dashboard */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            {t('settings.dashboard')}
          </h2>

          <div className="flex items-center justify-between mb-4 text-gray-700 dark:text-gray-200">
            <span>{t('settings.showProfit')}</span>
            <input
              type="checkbox"
              checked={settings.showProfit}
              onChange={() =>
                updateSettings({ showProfit: !settings.showProfit })
              }
            />
          </div>

          <div className="flex items-center justify-between mb-4 text-gray-700 dark:text-gray-200">
            <span>{t('settings.currency')}</span>
            <select
              value={settings.currency}
              onChange={(e) =>
                updateSettings({
                  currency: e.target.value as 'USD' | 'EUR',
                })
              }
              className="border rounded-lg px-3 py-1 bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          {/* Idioma */}
          <div className="flex items-center justify-between text-gray-700 dark:text-gray-200">
            <span>{t('settings.language')}</span>
            <select
              value={settings.language}
              onChange={(e) =>
                updateSettings({
                  language: e.target.value as 'es' | 'en',
                })
              }
              className="border rounded-lg px-3 py-1 bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </section>
      </div>
    </div>
  )
}
