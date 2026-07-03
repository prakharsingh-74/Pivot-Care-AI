"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { AnalyticsKpis } from "../components/analytics-kpis";
import { AnalyticsCharts } from "../components/analytics-charts";
import { AnalyticsInsightsTable } from "../components/analytics-insights-table";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { BarChart3, Bot, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { useState } from "react";
import { toast } from "sonner";

export const AnalyticsView = () => {
  const metrics = useQuery(api.private.analytics.getMetrics, {});
  const backfill = useMutation(api.private.analytics.backfillAnalytics);
  const [selectedRange, setSelectedRange] = useState<"7d" | "30d" | "quarter">("30d");
  const [syncing, setSyncing] = useState(false);

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      const res = await backfill();
      if (res.scheduledCount > 0) {
        toast.success("Metrics sync initiated", {
          description: (
            <span className="text-black dark:text-zinc-200 font-medium text-xs">
              Backfilling sentiment and categories for {res.scheduledCount} conversation(s).
            </span>
          ),
        });
      } else {
        toast.success("Metrics up to date", {
          description: (
            <span className="text-black dark:text-zinc-200 font-medium text-xs">
              All resolved and escalated conversations are categorized.
            </span>
          ),
        });
      }
    } catch (err) {
      toast.error("Failed to sync metrics", {
        description: (
          <span className="text-black dark:text-zinc-200 font-medium text-xs">
            Please check your network connection and try again.
          </span>
        ),
      });
    } finally {
      setSyncing(false);
    }
  };

  if (metrics === undefined) {
    return <AnalyticsViewLoading />;
  }

  // Format today's date
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden w-full min-w-0 bg-background/95 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-violet-600 dark:text-violet-400" />
            <h1 className="text-sm font-semibold tracking-tight text-foreground">Advanced Analytics & Support Insights</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={syncing} className="h-8 rounded-lg">
            <RefreshCw className={`size-3.5 mr-1 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Metrics"}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col gap-6 p-6 min-w-0 max-w-full overflow-x-hidden">
        {/* Title Block */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Operational Performance</h2>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <Calendar className="size-3 text-muted-foreground/70" />
              <span>Report Generated: {todayStr}</span>
              <span className="text-muted-foreground/30">•</span>
              <span className="inline-flex items-center gap-1 font-medium text-violet-600 dark:text-violet-400">
                <Bot className="size-3" />
                AI Agent Enhanced
              </span>
            </div>
          </div>

          {/* Date range picker selector */}
          <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/30 p-1">
            {(["7d", "30d", "quarter"] as const).map((range) => (
              <Button
                key={range}
                variant="ghost"
                size="sm"
                className={`h-7 px-3 text-xs font-semibold transition-all rounded-md ${selectedRange === range ? "bg-background text-foreground shadow-sm border border-border/30" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setSelectedRange(range)}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "Quarter"}
              </Button>
            ))}
          </div>
        </div>

        {/* 1. KPIs Section */}
        <AnalyticsKpis kpis={metrics.kpis} />

        {/* 2. Charts Section */}
        <AnalyticsCharts
          dailyData={metrics.dailyData}
          categoryData={metrics.categoryData}
          sentimentData={metrics.sentimentData}
        />

        {/* 3. Detailed Logs Section */}
        <AnalyticsInsightsTable conversations={metrics.recentConversations} />
      </div>
    </div>
  );
};

export const AnalyticsViewLoading = () => {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background/95 pb-8">
      {/* Skeleton Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-md" />
          <div className="h-4 w-px bg-border" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </header>

      {/* Skeleton Content */}
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-48 rounded-lg" />
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="col-span-2 rounded-xl border border-border/50 bg-card p-4 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
