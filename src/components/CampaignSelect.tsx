import { useState, useRef, useEffect } from 'react'
import { Campaign } from '@/lib/types'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { formatCurrency } from '@/lib/utils'
import { ChevronDown, Search, TrendingUp, DollarSign, MousePointer, Target } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface CampaignSelectProps {
  campaigns: Campaign[]
  selectedId?: string
  onSelect: (id: string) => void
}

export function CampaignSelect({ campaigns, selectedId, onSelect }: CampaignSelectProps) {
  const { settings } = useSettings()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedCampaign = campaigns.find(c => c.id === selectedId)
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (campaignId: string) => {
    onSelect(campaignId)
    setIsOpen(false)
    setSearchTerm('')
  }

  const getCampaignPerformance = (campaign: Campaign) => {
    const roas = campaign.totalValue / campaign.totalCost
    if (roas >= 4) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (roas >= 2) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (roas >= 1) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-50' }
  }

  return (
    <div className="mb-8">
      <label className="block text-lg font-semibold text-brand-navy mb-3">
        Select Campaign
      </label>
      
      <div className="relative" ref={dropdownRef}>
        {/* Main Selector Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-4 text-left bg-white border-2 border-brand-granite rounded-lg shadow-sm 
            hover:border-brand-steel focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent
            transition-all duration-200 flex items-center justify-between group"
        >
          <div className="flex-1">
            {selectedCampaign ? (
              <div>
                <div className="font-medium text-brand-navy text-lg">{selectedCampaign.name}</div>
                <div className="text-sm text-brand-graphite mt-1">
                  {formatCurrency(selectedCampaign.totalCost, settings.currency)} • {selectedCampaign.totalClicks} clicks • {selectedCampaign.totalConv} conv
                </div>
              </div>
            ) : (
              <div className="text-brand-graphite">All Campaigns</div>
            )}
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-brand-graphite transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border-brand-granite shadow-xl max-h-96 overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-brand-granite/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-graphite" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-brand-granite rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent
                    text-brand-navy placeholder-brand-graphite"
                  autoFocus
                />
              </div>
            </div>

            {/* Campaign List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredCampaigns.length === 0 ? (
                <div className="p-4 text-center text-brand-graphite">
                  No campaigns found matching "{searchTerm}"
                </div>
              ) : (
                <>
                  {/* All Campaigns Option */}
                  <button
                    onClick={() => handleSelect('')}
                    className={`w-full p-4 text-left hover:bg-brand-cream transition-colors border-b border-brand-granite/10
                      ${!selectedId ? 'bg-brand-orange/10 border-l-4 border-l-brand-orange' : ''}`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-brand-steel rounded-full flex items-center justify-center mr-3">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-brand-navy">All Campaigns</div>
                        <div className="text-sm text-brand-graphite">
                          View combined performance across all campaigns
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Individual Campaigns */}
                  {filteredCampaigns.map((campaign) => {
                    const performance = getCampaignPerformance(campaign)
                    const isSelected = selectedId === campaign.id
                    
                    return (
                      <button
                        key={campaign.id}
                        onClick={() => handleSelect(campaign.id)}
                        className={`w-full p-4 text-left hover:bg-brand-cream transition-colors border-b border-brand-granite/10
                          ${isSelected ? 'bg-brand-orange/10 border-l-4 border-l-brand-orange' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start flex-1">
                            <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center mr-3 mt-1">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-brand-navy text-left">{campaign.name}</div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-brand-graphite">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {formatCurrency(campaign.totalCost, settings.currency)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MousePointer className="w-3 h-3" />
                                  {campaign.totalClicks} clicks
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  {campaign.totalConv} conv
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Performance Indicator */}
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${performance.bg} ${performance.color}`}>
                            {performance.label}
                          </div>
                        </div>
                        
                        {/* Additional Metrics */}
                        <div className="mt-2 text-xs text-brand-graphite">
                          ROAS: {(campaign.totalValue / campaign.totalCost).toFixed(2)}x • 
                          CTR: {((campaign.totalClicks / campaign.totalImpr) * 100).toFixed(1)}% • 
                          CvR: {((campaign.totalConv / campaign.totalClicks) * 100).toFixed(1)}%
                        </div>
                      </button>
                    )
                  })}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-brand-cream/50 border-t border-brand-granite/20">
              <div className="text-xs text-brand-graphite text-center">
                {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 