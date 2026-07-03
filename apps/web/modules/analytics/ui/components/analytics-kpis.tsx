"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Bot, CheckCircle2, Clock, MessageSquare, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

interface AnalyticsKpisProps {
  kpis: {
    totalConversations: number;
    resolvedCount: number;
    escalatedCount: number;
    unresolvedCount: number;
    avgResponseTimeMin: number;
    avgResolutionTimeMin: number;
    deflectionRate: number;
    resolutionRate: number;
  };
}

export const AnalyticsKpis = ({ kpis }: AnalyticsKpisProps) => {
  const cards = [
    {
      title: "Open Conversations",
      value: kpis.unresolvedCount,
      icon: MessageSquare,
      description: "Active unresolved customer sessions",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Resolved Chats",
      value: kpis.resolvedCount,
      icon: CheckCircle2,
      description: "Successfully closed threads",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "AI Deflection Rate",
      value: `${kpis.deflectionRate}%`,
      icon: Bot,
      description: "Resolved completely without operator intervention",
      color: "text-violet-500 bg-violet-500/10",
      highlight: true,
    },
    {
      title: "Total Conversations",
      value: kpis.totalConversations,
      icon: Sparkles,
      description: "Lifetime conversation volume",
      color: "text-neutral-500 bg-neutral-500/10",
    },
    {
      title: "Resolution Rate",
      value: `${kpis.resolutionRate}%`,
      icon: TrendingUp,
      description: "Ratio of resolved vs. total inquiries",
      color: "text-cyan-500 bg-cyan-500/10",
    },
    {
      title: "Escalated to Human",
      value: kpis.escalatedCount,
      icon: ShieldAlert,
      description: "Escalated due to complexity or frustration",
      color: "text-red-500 bg-red-500/10",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 min-w-0">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={`relative overflow-hidden min-w-0 border-border/50 bg-card/60 backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md ${card.highlight ? "border-violet-500/30 bg-gradient-to-br from-card/60 via-card/60 to-violet-500/5" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{card.title}</span>
              <div className={`rounded-md p-1.5 shrink-0 ${card.color}`}>
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold tracking-tight">{card.value}</div>
              <p className="mt-1 text-[10px] text-muted-foreground leading-normal line-clamp-2">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
