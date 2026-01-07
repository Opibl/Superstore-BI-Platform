import { useState } from 'react'

/* ======================================================
   CONFIG
====================================================== */

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL as string

/* ======================================================
   COMPONENT
====================================================== */

export default function AdminCreateUser() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)
    setError(null)

    const token = localStorage.getItem('token')

    if (!token) {
      setError('Sesión no válida. Vuelve a iniciar sesión.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${AUTH_API_URL}/admin/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, role }),
      })

      // 🛡️ Leer JSON solo si existe
      let data: any = null
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      }

      if (!response.ok) {
        throw new Error(data?.message || `Error ${response.status}`)
      }

      setSuccess('✅ Usuario creado correctamente')
      setEmail('')
      setPassword('')
      setRole('user')
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="max-w-md bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Crear usuario</h2>

      {success && (
        <div className="mb-3 text-green-700 bg-green-100 p-2 rounded">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-3 text-red-700 bg-red-100 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          className="w-full px-4 py-2 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
        >
          <option value="user">Usuario</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creando…' : 'Crear usuario'}
        </button>
      </form>
    </div>
  )
}
