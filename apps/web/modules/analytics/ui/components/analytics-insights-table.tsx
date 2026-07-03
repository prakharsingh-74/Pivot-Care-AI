"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ArrowRight, Bot, MessageSquare, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

interface RecentConversationInsight {
  id: string;
  _creationTime: number;
  status: "unresolved" | "escalated" | "resolved";
  contactName: string;
  contactEmail: string;
  sentiment?: "positive" | "neutral" | "negative" | "mixed";
  category?: string;
  summary?: string;
  firstResponseTime?: number;
  resolutionTime?: number;
}

interface AnalyticsInsightsTableProps {
  conversations: RecentConversationInsight[];
}

export const AnalyticsInsightsTable = ({ conversations }: AnalyticsInsightsTableProps) => {
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "negative":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "neutral":
        return "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20";
      case "mixed":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-transparent";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />;
      case "escalated":
        return <AlertCircle className="size-4 text-red-500 shrink-0" />;
      default:
        return <MessageSquare className="size-4 text-blue-500 shrink-0" />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (ms === undefined) return "-";
    const totalMin = Math.round(ms / 1000 / 60);
    if (totalMin < 60) return `${totalMin}m`;
    const hours = (totalMin / 60).toFixed(1);
    return `${hours}h`;
  };

  return (
    <Card className="min-w-0 border-border/50 bg-card/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Support Insights & AI Audit Logs</CardTitle>
          <CardDescription className="text-xs">
            Review recent resolved and escalated conversations with automated AI categorization and transcripts.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-2 min-w-0 overflow-hidden">
        {conversations.length > 0 ? (
          <Table containerClassName="overflow-x-hidden min-w-0 w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                <TableHead className="hidden md:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sentiment</TableHead>
                <TableHead className="hidden sm:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Resolution Summary</TableHead>
                <TableHead className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">FR Time</TableHead>
                <TableHead className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resol. Time</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations.map((conv) => (
                <TableRow key={conv.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="py-3 max-w-[140px] md:max-w-[180px]">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate">{conv.contactName}</span>
                      <span className="text-[11px] text-muted-foreground truncate mt-0.5">{conv.contactEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-3">
                    {conv.category ? (
                      <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-500/5 border-violet-500/10 rounded-full">
                        {conv.category}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground font-light italic">Analyzing...</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    {conv.sentiment ? (
                      <Badge variant="outline" className={`px-2 py-0.5 text-xs font-medium border rounded-full ${getSentimentColor(conv.sentiment)}`}>
                        {conv.sentiment.toUpperCase()}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground font-light italic">Analyzing...</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-3 max-w-[300px]">
                    {conv.summary ? (
                      <p className="text-xs text-foreground font-medium line-clamp-2">
                        {conv.summary}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground font-light italic line-clamp-1">
                        Analyzing conversation transcript...
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-3 text-xs text-muted-foreground font-medium">
                    {formatDuration(conv.firstResponseTime)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-3 text-xs text-muted-foreground font-medium">
                    {formatDuration(conv.resolutionTime)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(conv.status)}
                      <span className="text-xs capitalize font-semibold">{conv.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button asChild size="sm" variant="ghost" className="h-8 p-2 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg group">
                      <Link href={`/conversations/${conv.id}`}>
                        <span className="text-xs mr-1 hidden sm:inline">View Chat</span>
                        <ChevronRight className="size-4 transition-transform group-hover:translate-x-[2px]" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border/60 rounded-xl bg-muted/20">
            <Bot className="size-10 text-muted-foreground/60 animate-bounce mb-3" />
            <span className="text-sm font-semibold text-muted-foreground">No insights logged yet</span>
            <span className="text-xs text-muted-foreground/75 mt-1">
              AI insights are generated once support conversations are resolved or escalated.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
