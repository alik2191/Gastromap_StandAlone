import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Base skeleton block — animated shimmer pulse.
 * Pass className for size / shape (rounded-*, h-*, w-*).
 */
export function Skeleton({ className }) {
    return (
        <div
            className={cn(
                'relative overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-2xl',
                'before:absolute before:inset-0',
                'before:bg-gradient-to-r before:from-transparent before:via-white/40 dark:before:via-white/10 before:to-transparent',
                'before:animate-[shimmer_1.5s_infinite]',
                className
            )}
        />
    )
}

// ─── Location card — Desktop (matches DesktopCard in LocationsPage) ─────────

export function LocationCardDesktopSkeleton({ isDark }) {
    return (
        <div className={cn(
            'flex flex-col p-4 rounded-[40px] border',
            isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
        )}>
            <Skeleton className="h-56 mb-5 rounded-[28px]" />
            <div className="space-y-3 px-2">
                <Skeleton className="h-6 w-3/4 rounded-xl" />
                <Skeleton className="h-4 w-1/2 rounded-xl" />
                <div className={cn('pt-4 border-t', isDark ? 'border-white/5' : 'border-gray-50')}>
                    <Skeleton className="h-4 w-1/3 rounded-xl" />
                </div>
            </div>
        </div>
    )
}

// ─── Location card — Mobile (matches MobileCard in LocationsPage) ────────────

export function LocationCardMobileSkeleton({ isDark }) {
    return (
        <div className={cn(
            'flex flex-col p-3 rounded-[32px] border',
            isDark ? 'bg-white/[0.03] border-white/5' : 'bg-white border-gray-100'
        )}>
            <Skeleton className="h-48 w-full rounded-[24px] mb-3" />
            <div className="px-1 pb-1 space-y-2.5">
                <Skeleton className="h-4 w-2/3 rounded-xl" />
                <Skeleton className="h-3 w-1/3 rounded-xl" />
            </div>
        </div>
    )
}

// ─── Dashboard horizontal scroll card (matches LocationCardMobile in Dashboard) ─

export function DashboardCardSkeleton({ isDark }) {
    return (
        <div className={cn(
            'flex-shrink-0 w-[220px] rounded-[28px] overflow-hidden shadow-xl',
            isDark ? 'bg-[#1a1c24] border border-white/5' : 'bg-white'
        )}>
            <Skeleton className="h-[180px] rounded-none" />
            <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-xl" />
                <Skeleton className="h-3 w-1/2 rounded-xl" />
                <div className="flex gap-1.5 mt-2">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                </div>
            </div>
        </div>
    )
}

// ─── City card (matches city card in CitiesPage mobile h-48 / desktop h-64) ──

export function CityCardSkeleton({ desktop = false }) {
    return (
        <div className={cn(
            'relative overflow-hidden rounded-[28px]',
            desktop ? 'h-64 rounded-[32px]' : 'h-48'
        )}>
            <Skeleton className="absolute inset-0 rounded-none" />
            {/* Simulate text overlay at the bottom */}
            <div className="absolute bottom-5 left-6 space-y-2">
                <Skeleton className="h-6 w-32 rounded-xl bg-white/20" />
                <Skeleton className="h-4 w-20 rounded-xl bg-white/10" />
            </div>
        </div>
    )
}

// ─── Location details hero (matches hero section in LocationDetailsPage) ─────

export function LocationDetailsSkeleton({ isDark }) {
    return (
        <div className="space-y-4">
            {/* Hero image */}
            <Skeleton className="h-[35vh] md:h-[50vh] w-full rounded-none" />
            {/* Bento grid */}
            <div className="grid grid-cols-2 md:grid-cols-12 gap-2 h-[300px] md:h-[600px] px-4">
                <Skeleton className="col-span-2 md:col-span-6 rounded-[24px] md:rounded-[48px]" />
                <Skeleton className="col-span-1 md:col-span-3 rounded-[24px] md:rounded-[40px]" />
                <Skeleton className="col-span-1 md:col-span-3 rounded-[24px] md:rounded-[40px]" />
                <Skeleton className="col-span-1 md:col-span-4 rounded-[24px] md:rounded-[40px]" />
                <Skeleton className="col-span-1 md:col-span-8 rounded-[24px] md:rounded-[40px]" />
            </div>
        </div>
    )
}
