'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { CampaignSelect } from '@/components/CampaignSelect'
import { MetricsScorecard } from '@/components/MetricsScorecard'
import { MetricsChart } from '@/components/MetricsChart'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { fetchAllTabsData, getCampaigns, getMetricsByDate, getMetricOptions } from '@/lib/sheetsData'
import { calculateDailyMetrics } from '@/lib/metrics'
import { formatCurrency } from '@/lib/utils'
import type { MetricKey, AdMetric, AllMetricKeys, DailyMetrics } from '@/lib/types'
import type { SheetTab } from '@/lib/config'
import { Button } from '@/components/ui/button'
import MetricsScatter from '@/components/MetricsScatter'

export function DashboardPage() {
    const { settings } = useSettings()
    const activeTab = settings.activeTab || 'daily'
    const metricOptions = getMetricOptions(activeTab)
    const [selectedMetrics, setSelectedMetrics] = useState<AllMetricKeys[]>(['cost', 'value'])
    const [chartType, setChartType] = useState<'line' | 'bar'>('line')
    const [vizTab, setVizTab] = useState<'timeseries' | 'scatter'>('timeseries')

    const { data: tabsData = {} as Record<SheetTab, AdMetric[]>, error, isLoading } = useSWR(
        settings.sheetUrl,
        fetchAllTabsData
    )

    // Ensure we're only using daily data for the dashboard
    const adData = (tabsData?.daily || []) as AdMetric[]
    const campaigns = getCampaigns(adData)

    // Initialize with highest spend campaign
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')

    // Update selected campaign when data changes
    useEffect(() => {
        if (campaigns.length > 0 && !selectedCampaignId) {
            // Campaigns are already sorted by totalCost descending
            setSelectedCampaignId(campaigns[0].id)
        }
    }, [campaigns, selectedCampaignId])

    const campaignData = getMetricsByDate(adData, selectedCampaignId)
    const dailyMetrics = calculateDailyMetrics(campaignData)

    const handleMetricClick = (metric: AllMetricKeys) => {
        setSelectedMetrics((current) => {
            if (current.includes(metric)) {
                return current.filter((m) => m !== metric)
            }
            if (current.length >= 2) {
                return [current[1], metric]
            }
            return [...current, metric]
        })
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">Error loading data</div>
            </div>
        )
    }

    if (isLoading) {
        return <div className="p-8 text-center text-brand-navy">Loading...</div>
    }

    // Combine metric options with calculated metrics
    const allMetricOptions = {
        ...metricOptions,
        CTR: { label: 'CTR', format: (val: number) => val.toFixed(1) + '%' },
        CvR: { label: 'CvR', format: (val: number) => val.toFixed(1) + '%' },
        CPA: { label: 'CPA', format: (val: number) => formatCurrency(val, settings.currency) },
        ROAS: { label: 'ROAS', format: (val: number) => val.toFixed(2) + 'x' },
        AOV: { label: 'AOV', format: (val: number) => formatCurrency(val, settings.currency) }
    }

    return (
        <div className="container mx-auto px-4 py-12 mt-16">
            <h1 className="text-3xl font-bold mb-12 text-brand-navy">Google Ads Dashboard</h1>

            <div className="mb-8">
                <CampaignSelect
                    campaigns={campaigns}
                    selectedId={selectedCampaignId}
                    onSelect={setSelectedCampaignId}
                />
            </div>

            <div className="space-y-4">
                <MetricsScorecard
                    data={dailyMetrics}
                    onMetricClick={handleMetricClick}
                    selectedMetrics={selectedMetrics}
                    metricOptions={allMetricOptions}
                />
            </div>

            {/* Visualization Tabs */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-brand-navy">Campaign Visualizations</h2>
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                            type="button"
                            onClick={() => setVizTab('timeseries')}
                            className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${vizTab === 'timeseries' ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-brand-navy border-brand-granite hover:bg-brand-cream'}`}
                        >
                            Time Series
                        </button>
                        <button
                            type="button"
                            onClick={() => setVizTab('scatter')}
                            className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${vizTab === 'scatter' ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-brand-navy border-brand-granite hover:bg-brand-cream'}`}
                        >
                            Efficiency Scatter
                        </button>
                    </div>
                </div>

                {vizTab === 'timeseries' ? (
                    <MetricsChart
                        data={dailyMetrics}
                        metric1={{
                            key: selectedMetrics[0],
                            label: metricOptions[selectedMetrics[0]].label,
                            color: '#1e40af',
                            format: (v: number) => metricOptions[selectedMetrics[0]].format(v)
                        }}
                        metric2={{
                            key: selectedMetrics[1],
                            label: metricOptions[selectedMetrics[1]].label,
                            color: '#ea580c',
                            format: (v: number) => metricOptions[selectedMetrics[1]].format(v)
                        }}
                        chartType={chartType}
                    />
                ) : (
                    <MetricsScatter data={dailyMetrics as any} />
                )}
            </div>
        </div>
    )
} 