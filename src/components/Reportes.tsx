import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { useSettings } from '../context/SettingsContext'
import { useTranslate } from '../i18n/useTranslate'

const API_URL = import.meta.env.VITE_DATA_API_URL as string

type ReportType =
  | 'sales-by-category'
  | 'sales-by-region'
  | 'sales-by-year'
  | 'top-products'
  | 'sales-by-segment'
  | 'sales-by-subcategory'
  | 'loss-making-products'
  | 'top-customers'
  | 'shipping-analysis'
  | 'sales-growth'

/* ======================================================
   HELPERS
====================================================== */

function convertCurrency(value: number, currency: 'USD' | 'EUR') {
  const EUR_RATE = 0.92
  return currency === 'EUR' ? value * EUR_RATE : value
}

/**
 * Formato VISUAL (UI) — respeta idioma
 */
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

/**
 * Detecta columnas monetarias
 */
function isCurrencyField(key: string) {
  return ['sales', 'profit', 'revenue', 'amount', 'total'].some(k =>
    key.toLowerCase().includes(k)
  )
}

/**
 * Formato TÉCNICO para CSV
 * - sin separador de miles
 * - decimal con punto
 */
function formatNumberForCSV(value: number) {
  return value.toFixed(2)
}

/**
 * Convierte y formatea una fila completa para exportación
 */
function formatRowForExport(
  row: Record<string, any>,
  currency: 'USD' | 'EUR'
) {
  const formatted: Record<string, string | number> = {}

  Object.entries(row).forEach(([key, value]) => {
    if (typeof value === 'number' && isCurrencyField(key)) {
      const converted = convertCurrency(value, currency)
      formatted[key] = formatNumberForCSV(converted)
    } else if (typeof value === 'number') {
      formatted[key] = formatNumberForCSV(value)
    } else {
      formatted[key] = value
    }
  })

  return formatted
}

export default function Reportes() {
  const { settings } = useSettings()
  const { t } = useTranslate()
  const currency = settings.currency

  const [reportType, setReportType] =
    useState<ReportType>('sales-by-category')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generateReport() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/${reportType}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
    } catch {
      setError(t('common.noData'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType])

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    downloadFile(blob, `${reportType}_${currency}.json`)
  }

  function downloadCSV() {
    if (data.length === 0) return

    const headers = Object.keys(data[0])

    const rows = data.map((row) => {
      const formattedRow = formatRowForExport(row, currency)
      return headers.map(h => `"${formattedRow[h]}"`).join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    downloadFile(blob, `${reportType}_${currency}.csv`)
  }

  function downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {t('reports.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('common.currency')}: {currency}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
          <select
            value={reportType}
            onChange={(e) =>
              setReportType(e.target.value as ReportType)
            }
            className="border rounded-lg px-4 py-2 bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          >
            <optgroup label={t('reports.basic')}>
              <option value="sales-by-category">{t('charts.salesByCategory')}</option>
              <option value="sales-by-region">{t('charts.salesByRegion')}</option>
              <option value="sales-by-year">{t('charts.salesByYear')}</option>
              <option value="top-products">{t('charts.topProducts')}</option>
            </optgroup>

            <optgroup label={t('reports.advanced')}>
              <option value="sales-by-segment">{t('charts.salesBySegment')}</option>
              <option value="sales-by-subcategory">{t('charts.marginBySubcategory')}</option>
              <option value="loss-making-products">{t('charts.lossProducts')}</option>
              <option value="top-customers">{t('charts.topCustomers')}</option>
              <option value="shipping-analysis">{t('charts.shipping')}</option>
              <option value="sales-growth">{t('charts.growth')}</option>
            </optgroup>
          </select>

          <button
            onClick={generateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('reports.generate')}
          </button>

          <button
            onClick={downloadCSV}
            disabled={data.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {t('reports.downloadCSV')}
          </button>

          <button
            onClick={downloadJSON}
            disabled={data.length === 0}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {t('reports.downloadJSON')}
          </button>
        </div>

        {loading && (
          <div className="text-gray-600 dark:text-gray-300">
            {t('common.loading')}
          </div>
        )}

        {error && (
          <div className="text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-200"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {Object.entries(row).map(([key, value]) => (
                      <td
                        key={key}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300"
                      >
                        {typeof value === 'number' && isCurrencyField(key)
                          ? formatCurrency(
                              convertCurrency(value, currency),
                              currency
                            )
                          : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
