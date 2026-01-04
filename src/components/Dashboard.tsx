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
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import { useSettings } from '../context/SettingsContext'
import { useTranslate } from '../i18n/useTranslate'

/* ======================================================
   CONFIG
====================================================== */

const API_URL = import.meta.env.VITE_DATA_API_URL as string

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

type SalesByMonth = { month: string; sales: number }
type SalesByCategory = { Category: string; sales: number }
type SalesByRegion = { Region: string; sales: number }
type SalesByYear = { year: number; sales: number }
type TopProduct = { 'Product Name': string; sales: number }

/* ======================================================
   MONTH TRANSLATIONS
====================================================== */

const MONTHS: Record<'es' | 'en', Record<string, string>> = {
  es: {
    Jan: 'Ene',
    Feb: 'Feb',
    Mar: 'Mar',
    Apr: 'Abr',
    May: 'May',
    Jun: 'Jun',
    Jul: 'Jul',
    Aug: 'Ago',
    Sep: 'Sep',
    Oct: 'Oct',
    Nov: 'Nov',
    Dec: 'Dic',
  },
  en: {
    Jan: 'Jan',
    Feb: 'Feb',
    Mar: 'Mar',
    Apr: 'Apr',
    May: 'May',
    Jun: 'Jun',
    Jul: 'Jul',
    Aug: 'Aug',
    Sep: 'Sep',
    Oct: 'Oct',
    Nov: 'Nov',
    Dec: 'Dec',
  },
}

/* ======================================================
   HELPERS
====================================================== */

function convertCurrency(value: number, currency: 'USD' | 'EUR') {
  const EUR_RATE = 0.92
  return currency === 'EUR' ? value * EUR_RATE : value
}

function formatCurrency(value: number, currency: 'USD' | 'EUR') {
  return new Intl.NumberFormat(
    currency === 'EUR' ? 'es-ES' : 'en-US',
    {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }
  ).format(value)
}

async function safeJson(res: Response) {
  if (res.headers.get('content-type')?.includes('application/json')) {
    return res.json()
  }
  throw new Error('Response is not JSON')
}

/* ======================================================
   DASHBOARD
====================================================== */

export default function Dashboard() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const { t, lang } = useTranslate()
  const currency = settings.currency

  const [kpis, setKpis] = useState<KPIsResponse | null>(null)
  const [salesByMonth, setSalesByMonth] = useState<SalesByMonth[]>([])
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[]>([])
  const [salesByRegion, setSalesByRegion] = useState<SalesByRegion[]>([])
  const [salesByYear, setSalesByYear] = useState<SalesByYear[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  useEffect(() => {
    if (!token) {
      handleLogout()
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    async function fetchData() {
      try {
        const responses = await Promise.all([
          fetch(`${API_URL}/kpis`, { headers }),
          fetch(`${API_URL}/sales-by-month`, { headers }),
          fetch(`${API_URL}/sales-by-category`, { headers }),
          fetch(`${API_URL}/sales-by-region`, { headers }),
          fetch(`${API_URL}/sales-by-year`, { headers }),
          fetch(`${API_URL}/top-products?limit=5`, { headers }),
        ])

        const [
          kpisData,
          monthData,
          categoryData,
          regionData,
          yearData,
          productData,
        ] = await Promise.all(responses.map(safeJson))

        setKpis(kpisData)
        setSalesByMonth(monthData)
        setSalesByCategory(categoryData)
        setSalesByRegion(regionData)
        setSalesByYear(yearData)
        setTopProducts(productData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading || !kpis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('common.currency')}: {currency}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard
            title={t('kpis.sales')}
            value={formatCurrency(convertCurrency(kpis.totalSales, currency), currency)}
            color="blue"
          />
          <MetricCard
            title={t('kpis.profit')}
            value={formatCurrency(convertCurrency(kpis.totalProfit, currency), currency)}
            color="green"
          />
          <MetricCard
            title={t('kpis.orders')}
            value={kpis.orders.toString()}
            color="yellow"
          />
          <MetricCard
            title={t('kpis.margin')}
            value={`${kpis.margin.toFixed(1)}%`}
            color="red"
          />
          <MetricCard
            title={t('kpis.ticket')}
            value={formatCurrency(convertCurrency(kpis.averageTicket, currency), currency)}
            color="purple"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title={t('charts.salesByMonth')}>
            <LineChart
              data={salesByMonth.map(d => ({
                ...d,
                month: MONTHS[lang][d.month] ?? d.month,
                sales: convertCurrency(d.sales, currency),
              }))}
            >
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(v?: number) =>
                  v !== undefined ? formatCurrency(v, currency) : ''
                }
              />
              <Line dataKey="sales" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ChartCard>

          <ChartCard title={t('charts.salesByRegion')}>
            <BarChart
              data={salesByRegion.map(d => ({
                ...d,
                sales: convertCurrency(d.sales, currency),
              }))}
            >
              <XAxis dataKey="Region" />
              <YAxis />
              <Tooltip
                formatter={(v?: number) =>
                  v !== undefined ? formatCurrency(v, currency) : ''
                }
              />
              <Bar dataKey="sales" fill="#22c55e" />
            </BarChart>
          </ChartCard>

          <ChartCard title={t('charts.salesByCategory')}>
            <BarChart
              data={salesByCategory.map(d => ({
                ...d,
                sales: convertCurrency(d.sales, currency),
              }))}
            >
              <XAxis dataKey="Category" />
              <YAxis />
              <Tooltip
                formatter={(v?: number) =>
                  v !== undefined ? formatCurrency(v, currency) : ''
                }
              />
              <Bar dataKey="sales" fill="#3b82f6" />
            </BarChart>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={t('charts.salesByYear')}>
            <LineChart
              data={salesByYear.map(d => ({
                ...d,
                sales: convertCurrency(d.sales, currency),
              }))}
            >
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(v?: number) =>
                  v !== undefined ? formatCurrency(v, currency) : ''
                }
              />
              <Line dataKey="sales" stroke="#9333ea" strokeWidth={3} />
            </LineChart>
          </ChartCard>

          <Card title={t('charts.topProducts')}>
            <ul className="space-y-2">
              {topProducts.map((p, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                >
                  <span>{p['Product Name']}</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      convertCurrency(p.sales, currency),
                      currency
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
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
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        {title}
      </h2>
      {children}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </Card>
  )
}
