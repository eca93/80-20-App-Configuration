'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Card } from '@/components/ui/card'

type ScatterDatum = {
  date: string
  cost: number
  conv: number
  clicks: number
  value: number
  ROAS?: number
}

interface MetricsScatterProps {
  data: ScatterDatum[]
  width?: number
  height?: number
  showTrendline?: boolean
}

// Scatter plot to show efficiency: how conversions scale with cost
// Color encodes ROAS, point size encodes clicks
export function MetricsScatter({ data, width = 900, height = 380, showTrendline = true }: MetricsScatterProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [trendOn, setTrendOn] = useState(showTrendline)

  // Precompute linear regression for a simple trendline
  const regression = useMemo(() => {
    if (!data || data.length < 2) return null
    const xs = data.map((d) => d.cost)
    const ys = data.map((d) => d.conv)
    const n = xs.length
    const sumX = xs.reduce((a, b) => a + b, 0)
    const sumY = ys.reduce((a, b) => a + b, 0)
    const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0)
    const sumXX = xs.reduce((acc, x) => acc + x * x, 0)
    const denom = n * sumXX - sumX * sumX
    if (denom === 0) return null
    const slope = (n * sumXY - sumX * sumY) / denom
    const intercept = (sumY - slope * sumX) / n
    return { slope, intercept }
  }, [data])

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return

    // Prepare
    const margin = { top: 20, right: 20, bottom: 44, left: 56 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    // Clear
    d3.select(svgRef.current).selectAll('*').remove()

    // Root
    const root = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Accessors
    const x = (d: ScatterDatum) => d.cost
    const y = (d: ScatterDatum) => d.conv
    const clicks = (d: ScatterDatum) => Math.max(1, d.clicks)
    const roas = (d: ScatterDatum) => (d.cost > 0 ? d.value / d.cost : 0)

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, x)! * 1.05])
      .range([0, innerW])
      .nice()

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, y)! * 1.05])
      .range([innerH, 0])
      .nice()

    const sizeScale = d3
      .scaleSqrt()
      .domain([d3.min(data, clicks) || 1, d3.max(data, clicks) || 10])
      .range([4, 12])

    // Brand color range: granite -> steel -> orange
    const colorScale = d3
      .scaleSequential(d3.interpolateRgbBasis(['#606160', '#57717C', '#F95535']))
      .domain([0.5, 4])

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((v) => d3.format('~s')(v as number))
    const yAxis = d3.axisLeft(yScale).ticks(6)

    root
      .append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(xAxis as any)
      .call((g) => g.selectAll('.domain').attr('stroke', '#606160'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#606160'))
      .call((g) => g.selectAll('.tick text').attr('fill', '#3F494A'))

    root
      .append('g')
      .call(yAxis as any)
      .call((g) => g.selectAll('.domain').attr('stroke', '#606160'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#606160'))
      .call((g) => g.selectAll('.tick text').attr('fill', '#3F494A'))

    // Axis labels
    root
      .append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 36)
      .attr('text-anchor', 'middle')
      .attr('fill', '#2C3C4A')
      .text('Cost')

    root
      .append('text')
      .attr('x', -innerH / 2)
      .attr('y', -36)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#2C3C4A')
      .text('Conversions')

    // Points
    root
      .append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => xScale(x(d)))
      .attr('cy', (d) => yScale(y(d)))
      .attr('r', (d) => sizeScale(clicks(d)))
      .attr('fill', (d) => colorScale(roas(d)))
      .attr('fill-opacity', 0.9)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .append('title')
      .text((d) => {
        const roasVal = roas(d)
        return `${d.date}\nCost: ${d3.format('$,.2f')(d.cost)}\nConv: ${d.conv}\nClicks: ${d.clicks}\nROAS: ${isFinite(roasVal) ? roasVal.toFixed(2) + 'x' : '-'}`
      })

    // Trendline (simple linear regression)
    if (trendOn && regression) {
      const xMin = xScale.domain()[0]
      const xMax = xScale.domain()[1]
      const yMin = regression.intercept + regression.slope * xMin
      const yMax = regression.intercept + regression.slope * xMax
      root
        .append('line')
        .attr('x1', xScale(xMin))
        .attr('y1', yScale(yMin))
        .attr('x2', xScale(xMax))
        .attr('y2', yScale(yMax))
        .attr('stroke', '#F95535')
        .attr('stroke-width', 2)
        .attr('opacity', 0.9)
    }

    // Helper line: constant ROAS = 1x
    const maxX = xScale.domain()[1]
    const guide = root.append('g')
    guide
      .append('line')
      .attr('x1', 0)
      .attr('y1', yScale(0))
      .attr('x2', xScale(maxX))
      .attr('y2', yScale(maxX ? maxX / 1 /* 1 conv per 1 cost, arbitrary scale */ : 0))
      .attr('stroke', '#EEB522')
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.6)

    // Legend (color and size)
    const legend = root.append('g').attr('transform', `translate(${innerW - 160}, 0)`)

    // Color legend
    const legendGradId = 'roasGradient'
    const defs = d3.select(svgRef.current).append('defs')
    const grad = defs.append('linearGradient').attr('id', legendGradId)
    grad.attr('x1', '0%').attr('x2', '100%')
    grad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorScale(0.5))
    grad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScale(4))

    legend
      .append('text')
      .attr('x', 0)
      .attr('y', 12)
      .attr('fill', '#2C3C4A')
      .style('font-size', '12px')
      .text('ROAS')

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', 16)
      .attr('width', 120)
      .attr('height', 8)
      .attr('fill', `url(#${legendGradId})`)

    legend
      .append('text')
      .attr('x', 0)
      .attr('y', 38)
      .attr('fill', '#3F494A')
      .style('font-size', '11px')
      .text('0.5x')

    legend
      .append('text')
      .attr('x', 120)
      .attr('y', 38)
      .attr('text-anchor', 'end')
      .attr('fill', '#3F494A')
      .style('font-size', '11px')
      .text('4x+')

    // Size legend
    const sizeLegend = legend.append('g').attr('transform', 'translate(0, 56)')
    sizeLegend
      .append('text')
      .attr('fill', '#2C3C4A')
      .style('font-size', '12px')
      .text('Clicks')
    const sizes = [d3.quantile(data.map(clicks).sort(d3.ascending), 0.2) || 5, d3.quantile(data.map(clicks).sort(d3.ascending), 0.6) || 20, d3.max(data, clicks) || 50]
    sizeLegend
      .selectAll('circle')
      .data(sizes)
      .join('circle')
      .attr('cx', (d, i) => i * 46 + 12)
      .attr('cy', 24)
      .attr('r', (d) => sizeScale(d))
      .attr('fill', '#F95535')
      .attr('opacity', 0.8)

    sizeLegend
      .selectAll('text.size')
      .data(sizes)
      .join('text')
      .attr('class', 'size')
      .attr('x', (d, i) => i * 46 + 12)
      .attr('y', 48)
      .attr('text-anchor', 'middle')
      .attr('fill', '#3F494A')
      .style('font-size', '11px')
      .text((d) => d3.format('~s')(d))
  }, [data, height, width, trendOn, regression])

  return (
    <Card className="p-4 bg-white border-brand-granite">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-brand-navy">Efficiency Scatter — Cost vs Conversions</h3>
        <div className="flex items-center gap-3">
          <p className="text-xs text-brand-graphite hidden sm:block">Point size = Clicks • Color = ROAS</p>
          <button
            onClick={() => setTrendOn((v) => !v)}
            className={`px-3 py-1 text-xs font-medium border rounded-md ${trendOn ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-brand-navy border-brand-granite hover:bg-brand-cream'}`}
          >
            {trendOn ? 'Trendline: On' : 'Trendline: Off'}
          </button>
        </div>
      </div>
      <svg ref={svgRef} className="w-full" style={{ height }} />
    </Card>
  )
}

export default MetricsScatter


