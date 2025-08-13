// src/components/MetricsScorecard.tsx
import { Card } from '@/components/ui/card'
import { AdMetric, MetricOptions, AllMetricKeys, DailyMetrics, SearchTermMetric } from '@/lib/types'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { formatCurrency } from '@/lib/utils'

interface MetricsScorecardProps {
  data: AdMetric[]
  onMetricClick: (metric: AllMetricKeys) => void
  selectedMetrics: AllMetricKeys[]
  metricOptions: MetricOptions
}

// Helper function to ensure we get a number
function getNumericValue(obj: any, key: string): number {
  const val = obj[key]
  return typeof val === 'number' ? val : 0
}

export function MetricsScorecard({ data, onMetricClick, selectedMetrics, metricOptions }: MetricsScorecardProps) {
  const latest = data[data.length - 1] || {} as AdMetric

  return (
    <div className="grid grid-cols-8 gap-4">
      {(Object.entries(metricOptions) as [AllMetricKeys, { label: string; format: (val: number) => string }][]).map(([key, { label, format }]) => {
        const isSelected = selectedMetrics.includes(key)

        // Get the value, handling all possible metric types
        let value = 0
        if (key in latest) {
          value = getNumericValue(latest, key)
        } else if ((latest as unknown as Partial<DailyMetrics>)[key as keyof DailyMetrics] !== undefined) {
          value = getNumericValue(latest as unknown as DailyMetrics, key as string)
        } else if ((latest as unknown as Partial<SearchTermMetric>)[key as keyof SearchTermMetric] !== undefined) {
          value = getNumericValue(latest as unknown as SearchTermMetric, key as string)
        }

        return (
          <Card
            key={key}
            className={`p-4 cursor-pointer hover:bg-brand-cream transition-colors bg-white border-brand-granite ${isSelected ? 'ring-2 ring-brand-orange shadow-lg' : ''
              }`}
            onClick={() => onMetricClick(key)}
          >
            <div className="text-sm text-brand-graphite">{label}</div>
            <div className="text-2xl font-semibold mt-1 text-brand-navy">
              {format(value)}
            </div>
          </Card>
        )
      })}
    </div>
  )
} 