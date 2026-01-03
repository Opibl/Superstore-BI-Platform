import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
const API_URL = import.meta.env.VITE_API_URL as string


/* ======================================================
   TYPES
====================================================== */

type KPIColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple'

type KPIsResponse = {
  totalSales: number
  totalProfit: number
  orders: number
  margin: number
  averageTicket: number
}

type SalesByMonth = {
  month: string
  sales: number
}

type SalesByCategory = {
  Category: string
  sales: number
}

type SalesByRegion = {
  Region: string
  sales: number
}

type SalesByYear = {
  year: number
  sales: number
  profit: number
}

type TopProduct = {
  'Product Name': string
  sales: number
}

/* ======================================================
   HELPERS
====================================================== */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

/* ======================================================
   DASHBOARD
====================================================== */

export default function Dashboard() {
  const navigate = useNavigate()

  const [kpis, setKpis] = useState<KPIsResponse | null>(null)
  const [salesByMonth, setSalesByMonth] = useState<SalesByMonth[]>([])
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[]>([])
  const [salesByRegion, setSalesByRegion] = useState<SalesByRegion[]>([])
  const [salesByYear, setSalesByYear] = useState<SalesByYear[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  /* ---------- LOAD DATA FROM API ---------- */
  useEffect(() => {
    async function fetchData() {
      try {
        const [
          kpisRes,
          monthRes,
          categoryRes,
          regionRes,
          yearRes,
          productRes,
        ] = await Promise.all([
          fetch(`${API_URL}/kpis`),
          fetch(`${API_URL}/sales-by-month`),
          fetch(`${API_URL}/sales-by-category`),
          fetch(`${API_URL}/sales-by-region`),
          fetch(`${API_URL}/sales-by-year`),
          fetch(`${API_URL}/top-products?limit=5`),
        ])

        setKpis(await kpisRes.json())
        setSalesByMonth(await monthRes.json())
        setSalesByCategory(await categoryRes.json())
        setSalesByRegion(await regionRes.json())
        setSalesByYear(await yearRes.json())
        setTopProducts(await productRes.json())
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  /* ---------- LOGOUT ---------- */
  const handleLogout = () => {
    localStorage.removeItem('auth')
    navigate('/')
  }

  if (loading || !kpis) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Cargando dashboard...
      </div>
    )
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">
            Superstore Sales Dashboard
          </h1>
          <p className="text-gray-600">
            FastAPI + React + Kaggle Dataset
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          Cerrar sesión
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard title="Ventas" value={formatCurrency(kpis.totalSales)} color="blue" />
        <MetricCard title="Ganancia" value={formatCurrency(kpis.totalProfit)} color="green" />
        <MetricCard title="Órdenes" value={kpis.orders.toString()} color="yellow" />
        <MetricCard title="Margen" value={`${kpis.margin.toFixed(1)}%`} color="red" />
        <MetricCard title="Ticket Promedio" value={formatCurrency(kpis.averageTicket)} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Ventas por mes">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="sales" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Ventas por región">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByRegion}>
              <XAxis dataKey="Region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ventas por año">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByYear}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line dataKey="sales" stroke="#9333ea" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top 5 productos">
          <ul className="space-y-2">
            {topProducts.map((p, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{p['Product Name']}</span>
                <span className="font-semibold">
                  {formatCurrency(p.sales)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

/* ======================================================
   COMPONENTS
====================================================== */

function MetricCard({
  title,
  value,
  color,
}: {
  title: string
  value: string
  color: KPIColor
}) {
  const colors: Record<KPIColor, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  )
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  )
}

