// src/app/terms/page.tsx
'use client'
import { useState, useMemo } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import type { SearchTermMetric, TabData } from '@/lib/types'
import { calculateAllSearchTermMetrics, type CalculatedSearchTermMetric } from '@/lib/metrics'
import { usePagination, DOTS } from '@/hooks/use-pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"


type SortField = keyof CalculatedSearchTermMetric
type SortDirection = 'asc' | 'desc'

const PAGE_SIZE = 20; // Show 20 items per page

export default function TermsPage() {
    const { settings, fetchedData, dataError, isDataLoading } = useSettings()
    const [sortField, setSortField] = useState<SortField>('cost')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [currentPage, setCurrentPage] = useState(1);


    // --- Hooks called unconditionally at the top --- 
    const searchTermsRaw = useMemo(() => (fetchedData?.searchTerms || []) as SearchTermMetric[], [fetchedData]);

    // Calculate derived metrics for all terms using useMemo
    const calculatedSearchTerms = useMemo(() => {
        return calculateAllSearchTermMetrics(searchTermsRaw)
    }, [searchTermsRaw])

    // Sort data (now using calculated terms)
    const sortedTerms = useMemo(() => {
        return [...calculatedSearchTerms].sort((a, b) => {
            const aVal = a[sortField]
            const bVal = b[sortField]
            // Handle potential string sorting for non-numeric fields if necessary
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return aVal.localeCompare(bVal) * (sortDirection === 'asc' ? 1 : -1);
            }
            return (Number(aVal) - Number(bVal)) * (sortDirection === 'asc' ? 1 : -1)
        })
    }, [calculatedSearchTerms, sortField, sortDirection])

    const paginationRange = usePagination({
        currentPage,
        totalCount: sortedTerms.length,
        siblingCount: 1,
        pageSize: PAGE_SIZE
    });

    // --- End of unconditional hooks ---

    // Calculate pagination variables
    const totalPages = Math.ceil(sortedTerms.length / PAGE_SIZE);
    const paginatedTerms = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return sortedTerms.slice(startIndex, startIndex + PAGE_SIZE);
    }, [sortedTerms, currentPage]);


    // Handle loading and error states *after* hooks
    if (dataError) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">Error loading data</div>
            </div>
        )
    }

    if (isDataLoading) {
        return <div className="p-8 text-center text-brand-navy">Loading...</div>
    }

    const handleSort = (field: SortField) => {
        const isStringField = ['searchTerm', 'campaign', 'adGroup', 'keywordText'].includes(field);
        const defaultDirection = isStringField ? 'asc' : 'desc';

        if (field === sortField) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection(defaultDirection)
        }
    }

    const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
        <Button
            variant="ghost"
            onClick={() => handleSort(field)}
            className="h-8 px-2 lg:px-3 text-brand-navy hover:text-brand-orange hover:bg-brand-cream"
        >
            {children}
            {sortField === field && (
                <span className="ml-2 text-brand-orange">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
            )}
        </Button>
    )

    return (
        <div className="container mx-auto px-4 py-12 mt-16">
            <h1 className="text-3xl font-bold mb-12 text-brand-navy">Search Terms</h1>

            <div className="rounded-md border border-brand-granite bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-brand-cream">
                            <TableHead className="w-[200px] text-brand-navy font-semibold">
                                <SortButton field="searchTerm">Search Term</SortButton>
                            </TableHead>
                            <TableHead className="text-brand-navy font-semibold">
                                <SortButton field="keywordText">Keyword</SortButton>
                            </TableHead>
                            <TableHead className="text-brand-navy font-semibold">
                                <SortButton field="campaign">Campaign</SortButton>
                            </TableHead>
                            <TableHead className="text-brand-navy font-semibold">
                                <SortButton field="adGroup">Ad Group</SortButton>
                            </TableHead>
                            <TableHead className="text-right text-brand-navy font-semibold">
                                <SortButton field="impr">Impr</SortButton>
                            </TableHead>
                            <TableHead className="text-right text-brand-navy font-semibold">
                                <SortButton field="clicks">Clicks</SortButton>
                            </TableHead>
                            <TableHead className="text-right text-brand-navy font-semibold">
                                <SortButton field="cost">Cost</SortButton>
                            </TableHead>
                            <TableHead className="text-right text-brand-navy font-semibold">
                                <SortButton field="conv">Conv</SortButton>
                            </TableHead>
                            <TableHead className="text-right text-brand-navy font-semibold">
                                <SortButton field="value">Value</SortButton>
                            </TableHead>
                            <TableHead className="text-right text-brand-navy font-semibold">
                                <SortButton field="CTR">CTR</SortButton>
                            </TableHead>
                            <TableHead className="text-right text-brand-navy font-semibold">
                                <SortButton field="CPC">CPC</SortButton>
                            </TableHead>
                            <TableHead className="text-right text-brand-navy font-semibold">
                                <SortButton field="CvR">CvR</SortButton>
                            </TableHead>
                            <TableHead className="text-right text-brand-navy font-semibold">
                                <SortButton field="CPA">CPA</SortButton>
                            </TableHead>
                            <TableHead className="text-right text-brand-navy font-semibold">
                                <SortButton field="ROAS">ROAS</SortButton>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTerms.map((term, i) => (
                            <TableRow key={`${term.searchTerm}-${term.campaign}-${term.adGroup}-${i}-${term.keywordText}`} className="hover:bg-brand-cream/50">
                                <TableCell className="font-medium text-brand-navy">{term.searchTerm}</TableCell>
                                <TableCell className="text-brand-graphite">{term.keywordText || '-'}</TableCell>
                                <TableCell className="text-brand-graphite">{term.campaign}</TableCell>
                                <TableCell className="text-brand-graphite">{term.adGroup}</TableCell>
                                <TableCell className="text-right text-brand-navy">{formatNumber(term.impr)}</TableCell>
                                <TableCell className="text-right text-brand-navy">{formatNumber(term.clicks)}</TableCell>
                                <TableCell className="text-right text-brand-navy">{formatCurrency(term.cost, settings.currency)}</TableCell>
                                <TableCell className="text-right text-brand-navy">{formatNumber(term.conv)}</TableCell>
                                <TableCell className="text-right text-brand-navy">{formatCurrency(term.value, settings.currency)}</TableCell>
                                <TableCell className="text-right text-brand-navy">{formatPercent(term.CTR)}</TableCell>
                                <TableCell className="text-right text-brand-navy">{formatCurrency(term.CPC, settings.currency)}</TableCell>
                                <TableCell className="text-right text-brand-navy">{formatPercent(term.CvR)}</TableCell>
                                <TableCell className="text-right text-brand-navy">{formatCurrency(term.CPA, settings.currency)}</TableCell>
                                <TableCell className="text-right text-brand-navy">
                                    {(term.ROAS && isFinite(term.ROAS)) ? `${term.ROAS.toFixed(2)}x` : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-brand-graphite">
                    Page {currentPage} of {totalPages}
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(prev => Math.max(prev - 1, 1));
                                }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "text-brand-navy hover:text-brand-orange"}
                            />
                        </PaginationItem>

                        {paginationRange?.map((pageNumber, index) => {
                            if (pageNumber === DOTS) {
                                return <PaginationItem key={`dots-${index}`}><PaginationEllipsis /></PaginationItem>;
                            }

                            return (
                                <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentPage(pageNumber as number);
                                        }}
                                        isActive={currentPage === pageNumber}
                                        className={currentPage === pageNumber ? "bg-brand-orange text-white" : "text-brand-navy hover:text-brand-orange"}
                                    >
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "text-brand-navy hover:text-brand-orange"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
} 