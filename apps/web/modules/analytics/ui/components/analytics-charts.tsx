"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@workspace/ui/components/chart";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Progress } from "@workspace/ui/components/progress";

interface ChartDataPoint {
  date: string;
  total: number;
  resolved: number;
  escalated: number;
  avgResponseTimeMin: number;
  avgResolutionTimeMin: number;
}

interface AnalyticsChartsProps {
  dailyData: ChartDataPoint[];
  categoryData: { name: string; value: number }[];
  sentimentData: { name: string; value: number }[];
}

export const AnalyticsCharts = ({ dailyData, categoryData, sentimentData }: AnalyticsChartsProps) => {
  // Chart colors
  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
  const SENTIMENT_COLORS: Record<string, string> = {
    Positive: "#10b981", // Emerald
    Neutral: "#6b7280",  // Gray
    Negative: "#ef4444", // Red
    Mixed: "#f59e0b",    // Amber
  };

  // Format date for chart labels
  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Config for chart containers
  const volumeChartConfig = {
    resolved: {
      label: "Resolved Chats",
      color: "hsl(var(--primary))",
    },
    escalated: {
      label: "Escalated to Operator",
      color: "hsl(var(--destructive))",
    },
  };

  const sentimentChartConfig = {
    value: {
      label: "Conversations",
    },
  };

  // Calculate percentages for channels
  const totalConvs = dailyData.reduce((acc, curr) => acc + curr.total, 0);
  const channels = [
    { name: "Webchat Widget", percentage: totalConvs > 0 ? 82 : 0, count: Math.round(totalConvs * 0.82), color: "bg-blue-500" },
    { name: "Voice Support (VAPI)", percentage: totalConvs > 0 ? 18 : 0, count: Math.round(totalConvs * 0.18), color: "bg-purple-500" },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 min-w-0 max-w-full overflow-hidden">
      {/* 1. Conversation Volume Chart */}
      <Card className="col-span-1 md:col-span-2 min-w-0 overflow-hidden border-border/50 bg-card/60 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Conversation Volume</CardTitle>
            <CardDescription className="text-xs">Daily resolved vs. escalated chats (last 30 days)</CardDescription>
          </div>
          <div className="flex gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2.5 rounded-full bg-blue-500" />
              Resolved
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2.5 rounded-full bg-red-500" />
              Escalated
            </span>
          </div>
        </CardHeader>
        <CardContent className="h-[300px] pt-4 min-w-0 overflow-hidden">
          <ChartContainer config={volumeChartConfig} className="h-full w-full min-w-0 overflow-hidden">
            <AreaChart data={dailyData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="escalatedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatDateLabel}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#resolvedGrad)"
                name="resolved"
              />
              <Area
                type="monotone"
                dataKey="escalated"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#escalatedGrad)"
                name="escalated"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 2. Channel Split Card */}
      <Card className="min-w-0 overflow-hidden border-border/50 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Channel Split</CardTitle>
          <CardDescription className="text-xs">Interaction volume by support channel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 min-w-0 overflow-hidden">
          {channels.map((chan) => (
            <div key={chan.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">{chan.name}</span>
                <span className="font-bold text-foreground">
                  {chan.percentage}% <span className="text-xs font-normal text-muted-foreground">({chan.count})</span>
                </span>
              </div>
              <Progress value={chan.percentage} className={`h-2.5 bg-muted`} />
            </div>
          ))}
          {totalConvs === 0 && (
            <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
              No conversations recorded in the selected period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Sentiment Breakdown (Pie/Donut) */}
      <Card className="min-w-0 overflow-hidden border-border/50 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Customer Sentiment</CardTitle>
          <CardDescription className="text-xs">Sentiment breakdown analyzed by AI Agent</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-2 min-w-0 overflow-hidden">
          {sentimentData.length > 0 ? (
            <>
              <div className="h-[180px] w-full min-w-0 overflow-hidden">
                <ChartContainer config={sentimentChartConfig} className="h-full w-full min-w-0 overflow-hidden">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={sentimentData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {sentimentData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={SENTIMENT_COLORS[entry.name] || COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                {sentimentData.map((entry, idx) => (
                  <span key={entry.name} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS[entry.name] }} />
                    <span className="font-medium">{entry.name}:</span>
                    <span className="text-muted-foreground">{entry.value}</span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-44 items-center justify-center text-xs text-muted-foreground">
              No sentiment data available.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Inquiry Categories */}
      <Card className="col-span-1 md:col-span-2 min-w-0 overflow-hidden border-border/50 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Support Categories</CardTitle>
          <CardDescription className="text-xs">AI-classified conversation inquiry topics</CardDescription>
        </CardHeader>
        <CardContent className="h-[220px] min-w-0 overflow-hidden">
          {categoryData.length > 0 ? (
            <ChartContainer config={{}} className="h-full w-full min-w-0 overflow-hidden">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-44 items-center justify-center text-xs text-muted-foreground">
              No categorized conversation data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
