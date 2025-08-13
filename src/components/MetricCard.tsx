import { Card } from '@/components/ui/card'

interface MetricCardProps {
  label: string
  value: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function MetricCard({ 
  label, 
  value, 
  isSelected, 
  onClick,
  className = ''
}: MetricCardProps) {
  return (
    <Card
      className={`
        p-4 transition-all bg-white border-brand-granite
        ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-brand-orange/50 hover:shadow-lg' : ''}
        ${isSelected ? 'ring-2 ring-brand-orange shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="text-sm font-medium text-brand-graphite">{label}</div>
      <div className="text-2xl font-bold mt-1 text-brand-navy">{value}</div>
    </Card>
  )
} 