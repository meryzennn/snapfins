// ─── SnapFins Skeleton Component Library ──────────────────────────────────────
// Premium animated skeleton loaders matching the dark-fintech design system.

import React from "react";

// ─── Base pulse box ──────────────────────────────────────────────────────────
export function Sk({
  className = "",
  rounded = "rounded-lg",
  style,
}: {
  className?: string;
  rounded?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-shimmer ${rounded} ${className}`}
      style={style}
    />
  );
}

// ─── Skeleton Text line ──────────────────────────────────────────────────────
export function SkText({ w = "w-full", h = "h-3" }: { w?: string; h?: string }) {
  return <Sk className={`${w} ${h}`} rounded="rounded-md" />;
}

// ─── Skeleton Metric Card (used on dashboard summary cards) ─────────────────
export function SkMetricCard() {
  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <Sk className="w-24 h-3" rounded="rounded-md" />
        <Sk className="w-8 h-8" rounded="rounded-xl" />
      </div>
      <Sk className="w-32 h-7" rounded="rounded-lg" />
      <Sk className="w-20 h-3" rounded="rounded-md" />
    </div>
  );
}

// ─── Skeleton Chart block ────────────────────────────────────────────────────
export function SkChart({ h = "h-[220px]" }: { h?: string }) {
  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col gap-2 mb-5">
        <Sk className="w-40 h-4" rounded="rounded-md" />
        <Sk className="w-64 h-3" rounded="rounded-md" />
      </div>
      <div className={`${h} flex items-end gap-2 px-2`}>
        {[60, 80, 45, 90, 70, 50, 85, 40, 75, 95, 55, 65].map((pct, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <Sk
              className="w-full"
              rounded="rounded-t-md"
              style={{ height: `${pct}%` } as React.CSSProperties}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton Donut chart ────────────────────────────────────────────────────
export function SkDonut() {
  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col gap-2 mb-5">
        <Sk className="w-40 h-4" rounded="rounded-md" />
        <Sk className="w-52 h-3" rounded="rounded-md" />
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Donut placeholder */}
        <div className="relative w-[160px] h-[160px] shrink-0">
          <Sk className="w-full h-full" rounded="rounded-full" />
          <div className="absolute inset-[28px] bg-background dark:bg-slate-950 rounded-full" />
        </div>
        {/* Legend rows */}
        <div className="flex flex-col gap-2.5 flex-1 w-full">
          {[70, 55, 45, 35, 25].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <Sk className="w-2.5 h-2.5 shrink-0" rounded="rounded-full" />
              <Sk className={`h-3`} rounded="rounded-md" style={{ width: `${w}%` } as React.CSSProperties} />
              <Sk className="w-10 h-3 ml-auto shrink-0" rounded="rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Table Row ───────────────────────────────────────────────────────
export function SkTableRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-outline-variant/10 px-4">
      <Sk className="w-4 h-4 shrink-0" rounded="rounded" />
      <Sk className="w-20 h-3" rounded="rounded-md" />
      <Sk className="w-16 h-5" rounded="rounded-md" />
      <Sk className="flex-1 h-3" rounded="rounded-md" />
      <Sk className="w-12 h-3 hidden sm:block" rounded="rounded-md" />
      <Sk className="w-20 h-4 ml-auto shrink-0" rounded="rounded-md" />
      <Sk className="w-6 h-6 shrink-0" rounded="rounded-full" />
    </div>
  );
}

// ─── Skeleton Insight Card ────────────────────────────────────────────────────
export function SkInsightCard() {
  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
      <Sk className="w-9 h-9 shrink-0" rounded="rounded-xl" />
      <div className="flex flex-col gap-2 flex-1">
        <Sk className="w-24 h-2.5" rounded="rounded-md" />
        <Sk className="w-36 h-4" rounded="rounded-md" />
        <Sk className="w-28 h-2.5" rounded="rounded-md" />
      </div>
    </div>
  );
}

// ─── Skeleton Asset Row ───────────────────────────────────────────────────────
export function SkAssetRow() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-outline-variant/10 px-4">
      <Sk className="w-4 h-4 shrink-0" rounded="rounded" />
      <div className="flex flex-col gap-1.5 flex-1">
        <Sk className="w-28 h-3.5" rounded="rounded-md" />
        <Sk className="w-16 h-2.5" rounded="rounded-md" />
      </div>
      <Sk className="w-14 h-5 hidden sm:block" rounded="rounded-md" />
      <Sk className="w-16 h-3 hidden md:block" rounded="rounded-md" />
      <Sk className="w-24 h-4 ml-auto shrink-0" rounded="rounded-md" />
      <Sk className="w-6 h-6 shrink-0" rounded="rounded-full" />
    </div>
  );
}

// ─── Full Dashboard Skeleton ─────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse-once">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <Sk className="w-64 h-8" rounded="rounded-xl" />
            <Sk className="w-40 h-3" rounded="rounded-md" />
          </div>
          <div className="flex gap-3">
            <Sk className="w-36 h-10" rounded="rounded-xl" />
            <Sk className="w-36 h-10" rounded="rounded-xl" />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkMetricCard key={i} />)}
        </div>

        {/* Chart */}
        <SkChart h="h-[200px]" />

        {/* Table section */}
        <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
          {/* Table head */}
          <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 flex items-center gap-4 border-b border-outline-variant/10">
            {["w-4", "w-20", "w-20", "flex-1", "w-16", "w-20", "w-16"].map((w, i) => (
              <Sk key={i} className={`${w} h-3`} rounded="rounded-md" />
            ))}
          </div>
          {[...Array(6)].map((_, i) => <SkTableRow key={i} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Full Assets Skeleton ────────────────────────────────────────────────────
export function AssetsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Sk className="w-48 h-7" rounded="rounded-xl" />
            <Sk className="w-32 h-3" rounded="rounded-md" />
          </div>
          <Sk className="w-36 h-10" rounded="rounded-xl" />
        </div>

        {/* Asset Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <SkMetricCard key={i} />)}
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 flex items-center gap-4 border-b border-outline-variant/10">
            {["w-4", "flex-1", "w-20", "w-20 hidden sm:block", "w-24", "w-20 hidden md:block", "w-8"].map((w, i) => (
              <Sk key={i} className={`${w} h-3`} rounded="rounded-md" />
            ))}
          </div>
          {[...Array(5)].map((_, i) => <SkAssetRow key={i} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Full Analytics Skeleton ─────────────────────────────────────────────────
export function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <Sk className="w-40 h-7" rounded="rounded-xl" />
            <Sk className="w-60 h-3" rounded="rounded-md" />
          </div>
          <div className="flex gap-2">
            <Sk className="w-24 h-9" rounded="rounded-xl" />
            <Sk className="w-32 h-9" rounded="rounded-xl" />
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => <SkMetricCard key={i} />)}
        </div>

        {/* Area chart */}
        <SkChart h="h-[220px]" />

        {/* Bar chart */}
        <SkChart h="h-[220px]" />

        {/* Two donuts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SkDonut />
          <SkDonut />
        </div>

        {/* Insights */}
        <div className="space-y-3">
          <Sk className="w-36 h-5" rounded="rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <SkInsightCard key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page Skeleton ────────────────────────────────────────────────────
export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-50 border-b border-outline-variant/20 bg-background/80 backdrop-blur-md px-6 py-3 flex justify-between items-center">
        <Sk className="w-24 h-6" rounded="rounded-lg" />
        <div className="hidden md:flex gap-6 items-center">
          {[...Array(3)].map((_, i) => <Sk key={i} className="w-16 h-3" rounded="rounded-md" />)}
        </div>
        <div className="flex gap-2 items-center">
          <Sk className="w-8 h-8" rounded="rounded-full" />
          <Sk className="w-24 h-9" rounded="rounded-xl" />
        </div>
      </div>

      {/* Hero section skeleton */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center gap-6">
        <Sk className="w-48 h-7" rounded="rounded-full" />
        <div className="flex flex-col items-center gap-3 w-full max-w-xl">
          <Sk className="w-full h-12" rounded="rounded-2xl" />
          <Sk className="w-4/5 h-12" rounded="rounded-2xl" />
        </div>
        <Sk className="w-2/3 h-5" rounded="rounded-xl" />
        <Sk className="w-1/2 h-4" rounded="rounded-xl" />
        <div className="flex gap-3 mt-2">
          <Sk className="w-36 h-12" rounded="rounded-2xl" />
          <Sk className="w-36 h-12" rounded="rounded-2xl" />
        </div>

        {/* Mock dashboard preview */}
        <div className="w-full mt-8 bg-slate-100 dark:bg-slate-800/50 border border-outline-variant/20 rounded-3xl p-4 space-y-3 shadow-xl">
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => <Sk key={i} className="flex-1 h-24" rounded="rounded-2xl" />)}
          </div>
          <Sk className="w-full h-40" rounded="rounded-2xl" />
          {[...Array(3)].map((_, i) => <Sk key={i} className="w-full h-10" rounded="rounded-xl" />)}
        </div>
      </div>

      {/* Features section skeleton */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <div className="flex flex-col items-center gap-3">
          <Sk className="w-28 h-5" rounded="rounded-full" />
          <Sk className="w-64 h-8" rounded="rounded-xl" />
          <Sk className="w-80 h-4" rounded="rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-outline-variant/20 rounded-2xl p-5 space-y-3">
              <Sk className="w-10 h-10" rounded="rounded-xl" />
              <Sk className="w-32 h-4" rounded="rounded-lg" />
              <Sk className="w-full h-3" rounded="rounded-md" />
              <Sk className="w-4/5 h-3" rounded="rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
