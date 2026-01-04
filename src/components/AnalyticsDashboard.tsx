import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts'
import Sidebar from './Sidebar'
import { useSettings } from '../context/SettingsContext'
import { useTranslate } from '../i18n/useTranslate'

const API_URL = import.meta.env.VITE_DATA_API_URL as string

/* ================= TYPES ================= */

type KPI = {
  totalSales: number
  totalProfit: number
  orders: number
  margin: number
  averageTicket: number
}

export default function AnalyticsDashboard() {
  const { settings } = useSettings()
  const { t } = useTranslate()
  const currency = settings.currency

  const [kpis, setKpis] = useState<KPI | null>(null)
  const [growth, setGrowth] = useState<any[]>([])
  const [segments, setSegments] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [lossProducts, setLossProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [shipping, setShipping] = useState<any[]>([])
  const [alerts, setAlerts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  /* ================= HELPERS ================= */

  const convert = (v: number) =>
    currency === 'EUR' ? v * 0.92 : v

  const format = (v: number) =>
    new Intl.NumberFormat(currency === 'EUR' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(v)

  /* ================= DATA ================= */

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/kpis`).then(r => r.json()),
      fetch(`${API_URL}/sales-growth`).then(r => r.json()),
      fetch(`${API_URL}/sales-by-segment`).then(r => r.json()),
      fetch(`${API_URL}/sales-by-subcategory`).then(r => r.json()),
      fetch(`${API_URL}/loss-making-products`).then(r => r.json()),
      fetch(`${API_URL}/top-customers`).then(r => r.json()),
      fetch(`${API_URL}/shipping-analysis`).then(r => r.json()),
      fetch(`${API_URL}/alerts`).then(r => r.json()),
    ])
      .then(([k, g, s, sc, lp, c, sh, al]) => {
        setKpis(k)
        setGrowth(g.slice(1)) // quitar primer mes (0)
        setSegments(s)
        setSubcategories(sc)
        setLossProducts(lp)
        setCustomers(c)
        setShipping(sh)
        setAlerts(al)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading || !kpis) {
    return (
      <div className="p-10 text-gray-600 dark:text-gray-300">
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 space-y-10">

        {/* ================= KPIs ================= */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <KPI title={t('kpis.sales')} value={format(convert(kpis.totalSales))} />
          <KPI title={t('kpis.profit')} value={format(convert(kpis.totalProfit))} />
          <KPI title={t('kpis.orders')} value={kpis.orders.toString()} />
          <KPI title={t('kpis.margin')} value={`${kpis.margin}%`} />
          <KPI title={t('kpis.ticket')} value={format(convert(kpis.averageTicket))} />
        </section>

        {/* ================= GROWTH ================= */}
        <Card title={t('charts.growth')}>
          <ResponsiveContainer height={300}>
            <LineChart data={growth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value?: number) =>
                  value !== undefined ? `${value}%` : ''
                }
              />
              <ReferenceLine y={0} stroke="#999" />
              <Line
                dataKey="growth_pct"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* ================= SEGMENTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={t('charts.salesBySegment')}>
            <BarChartBlock data={segments} x="Segment" y="sales" />
          </Card>

          <Card title={t('charts.marginBySubcategory')}>
            <BarChartBlock
              data={subcategories}
              x="Sub-Category"
              y="margin"
              color="#ef4444"
            />
          </Card>
        </div>

        {/* ================= LOSS PRODUCTS ================= */}
        <Card title={t('charts.lossProducts')}>
          <ul className="space-y-2">
            {lossProducts.map(p => (
              <li
                key={p['Product Name']}
                className="flex justify-between text-red-500 text-sm"
              >
                <span>{p['Product Name']}</span>
                <span>{format(convert(p.profit))}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* ================= CUSTOMERS ================= */}
        <Card title={t('charts.topCustomers')}>
          <BarChartBlock data={customers} x="Customer Name" y="sales" />
        </Card>

        {/* ================= SHIPPING ================= */}
        <Card title={t('charts.shipping')}>
          <BarChartBlock
            data={shipping}
            x="Ship Mode"
            y="avg_delivery_days"
          />
        </Card>

        {/* ================= ALERTS ================= */}
        <Card title={t('charts.alerts')}>
          <ul className="space-y-2">
            {alerts.map((a, i) => (
              <li key={i} className="text-yellow-600 text-sm">
                {a}
              </li>
            ))}
          </ul>
        </Card>

      </main>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function KPI({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  )
}

function BarChartBlock({
  data,
  x,
  y,
  color = '#22c55e',
}: {
  data: any[]
  x: string
  y: string
  color?: string
}) {
  return (
    <ResponsiveContainer height={300}>
      <BarChart data={data}>
        <XAxis dataKey={x} hide />
        <YAxis />
        <Tooltip />
        <Bar dataKey={y} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  )
}
