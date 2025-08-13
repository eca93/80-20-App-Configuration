'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Settings } from 'lucide-react'


export function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-brand-steel bg-brand-navy shadow-lg">
            <div className="container mx-auto px-4 h-16 flex items-center">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-6">
                        <Link href="/" className="flex items-center">
                            <span className="font-bold text-brand-cream text-lg">
                                Google Ads Dashboard
                            </span>
                        </Link>
                        <Link
                            href="/terms"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-brand-orange",
                                pathname === "/terms" ? "text-brand-orange" : "text-brand-cream/80"
                            )}
                        >
                            Search Terms
                        </Link>
                        
                    </div>
                    <Link
                        href="/settings"
                        className={cn(
                            "transition-colors hover:text-brand-orange",
                            pathname === "/settings" ? "text-brand-orange" : "text-brand-cream/80"
                        )}
                    >
                        <Settings size={20} />
                    </Link>
                </div>
            </div>
        </nav>
    )
} 