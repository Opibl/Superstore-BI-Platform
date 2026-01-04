import { createContext, useContext, useEffect, useState } from 'react'

/* ================= TYPES ================= */

type Currency = 'USD' | 'EUR'
type Language = 'es' | 'en'

type Settings = {
  darkMode: boolean
  showProfit: boolean
  currency: Currency
  language: Language
}

type SettingsContextType = {
  settings: Settings
  updateSettings: (s: Partial<Settings>) => void
}

/* ================= DEFAULT ================= */

const defaultSettings: Settings = {
  darkMode: false,
  showProfit: true,
  currency: 'USD',
  language: 'es',
}

const SettingsContext = createContext<SettingsContextType | null>(null)

/* ================= PROVIDER ================= */

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings')
    return saved ? JSON.parse(saved) : defaultSettings
  })

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings))
  }, [settings])

  function updateSettings(newSettings: Partial<Settings>) {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      <div className={settings.darkMode ? 'dark' : ''}>
        {children}
      </div>
    </SettingsContext.Provider>
  )
}

/* ================= HOOK ================= */

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used inside SettingsProvider')
  }
  return ctx
}
