import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslate } from '../i18n/useTranslate'

export default function Register() {
  const navigate = useNavigate()
  const { t, lang, setLang } = useTranslate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        'https://backend-login-deashboard.vercel.app/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Register failed')
      }

      setSuccess(true)

      // ⏳ Redirigir al login
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      setError(t('register.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleRegister}
        className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        {/* 🌍 Language selector */}
        <div className="absolute top-4 right-4">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'es' | 'en')}
            className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="es">🇪🇸 ES</option>
            <option value="en">🇺🇸 EN</option>
          </select>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          {t('register.title')}
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 p-2 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-sm text-green-600 bg-green-100 dark:bg-green-900/30 p-2 rounded">
            {t('register.success')}
          </div>
        )}

        <input
          type="email"
          placeholder={t('register.email')}
          className="w-full mb-4 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder={t('register.password')}
          className="w-full mb-6 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? t('register.loading') : t('register.submit')}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
          {t('register.haveAccount')}{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            {t('register.login')}
          </Link>
        </p>
      </form>
    </div>
  )
}
