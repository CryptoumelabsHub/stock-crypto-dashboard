'use client'

import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

enum AssetType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO'
}

interface PriceChartProps {
  symbol: string
  type: AssetType
}

export default function PriceChart({ symbol, type }: PriceChartProps) {
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/prices?symbol=${symbol}&type=${type}`)
        if (!response.ok) {
          throw new Error('Failed to fetch price data')
        }
        const data = await response.json()

        const labels = data.prices.map((p: any) => new Date(p.timestamp).toLocaleDateString())
        const prices = data.prices.map((p: any) => p.price)

        setChartData({
          labels,
          datasets: [
            {
              label: `${symbol} Price`,
              data: prices,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPriceData()
  }, [symbol, type])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!chartData) {
    return null
  }

  return (
    <div className="p-4">
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: `${symbol} Price History`,
            },
          },
          scales: {
            y: {
              beginAtZero: false,
            },
          },
        }}
      />
    </div>
  )
}
