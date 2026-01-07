import { useSettings } from '../context/SettingsContext'
import { translations } from './translations'

export type Language = 'es' | 'en'

export function useTranslate() {
  const { settings, updateSettings } = useSettings()
  const lang = settings.language as Language

  function t(path: string): string {
    return (
      path
        .split('.')
        .reduce(
          (obj: any, key) => obj?.[key],
          translations[lang]
        ) ?? path
    )
  }

  // ✅ NUEVO: cambiar idioma
  function setLang(language: Language) {
    updateSettings({ language })
  }

  return {
    t,
    lang,
    setLang, // 👈 ahora EXISTE
  }
}
