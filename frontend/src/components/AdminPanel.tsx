import AdminCreateUser from './AdminCreateUser'

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        Panel de Administración
      </h1>

      <AdminCreateUser />
    </div>
  )
}
