import { ConvexError, v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { internal } from "../_generated/api";

export const getMetrics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    // Fetch all conversations for the organization
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .order("desc")
      .collect();

    let totalConversations = conversations.length;
    let resolvedCount = 0;
    let escalatedCount = 0;
    let unresolvedCount = 0;

    let totalResponseTime = 0;
    let responseTimeCount = 0;

    let totalResolutionTime = 0;
    let resolutionTimeCount = 0;

    let deflectionCount = 0;

    const sentimentCounts: Record<string, number> = {
      positive: 0,
      neutral: 0,
      negative: 0,
      mixed: 0,
    };

    const categoryCounts: Record<string, number> = {};

    // Grouping by date (YYYY-MM-DD)
    const dailyDataMap: Record<
      string,
      {
        date: string;
        total: number;
        resolved: number;
        escalated: number;
        responseTimeSum: number;
        responseTimeCount: number;
        resolutionTimeSum: number;
        resolutionTimeCount: number;
      }
    > = {};

    const recentConversations = [];

    for (const conv of conversations) {
      // Basic counts
      if (conv.status === "resolved") {
        resolvedCount++;
        if (conv.wasEscalated !== true) {
          deflectionCount++;
        }
      } else if (conv.status === "escalated") {
        escalatedCount++;
      } else {
        unresolvedCount++;
      }

      // Response & Resolution Times
      if (conv.firstResponseTime !== undefined) {
        totalResponseTime += conv.firstResponseTime;
        responseTimeCount++;
      }
      if (conv.resolutionTime !== undefined) {
        totalResolutionTime += conv.resolutionTime;
        resolutionTimeCount++;
      }

      // Sentiment
      if (conv.sentiment) {
        sentimentCounts[conv.sentiment] = (sentimentCounts[conv.sentiment] || 0) + 1;
      }

      // Category
      if (conv.category) {
        categoryCounts[conv.category] = (categoryCounts[conv.category] || 0) + 1;
      }

      // Grouping for time series
      const dateStr = new Date(conv._creationTime).toISOString().split("T")[0]!;
      if (!dailyDataMap[dateStr]) {
        dailyDataMap[dateStr] = {
          date: dateStr,
          total: 0,
          resolved: 0,
          escalated: 0,
          responseTimeSum: 0,
          responseTimeCount: 0,
          resolutionTimeSum: 0,
          resolutionTimeCount: 0,
        };
      }

      const day = dailyDataMap[dateStr]!;
      day.total++;
      if (conv.status === "resolved") day.resolved++;
      if (conv.status === "escalated") day.escalated++;
      if (conv.firstResponseTime !== undefined) {
        day.responseTimeSum += conv.firstResponseTime;
        day.responseTimeCount++;
      }
      if (conv.resolutionTime !== undefined) {
        day.resolutionTimeSum += conv.resolutionTime;
        day.resolutionTimeCount++;
      }

      // Add to recent list
      if (recentConversations.length < 15) {
        const contactSession = await ctx.db.get(conv.contactSessionId);
        recentConversations.push({
          id: conv._id,
          _creationTime: conv._creationTime,
          status: conv.status,
          contactName: contactSession?.name || "Anonymous",
          contactEmail: contactSession?.email || "Unknown",
          sentiment: conv.sentiment,
          category: conv.category,
          summary: conv.summary,
          firstResponseTime: conv.firstResponseTime,
          resolutionTime: conv.resolutionTime,
        });
      }
    }

    // Fill in last 30 days to avoid empty charts
    const dailyData = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]!;
      
      const dayVal = dailyDataMap[dateStr];
      if (dayVal) {
        dailyData.push({
          date: dateStr,
          total: dayVal.total,
          resolved: dayVal.resolved,
          escalated: dayVal.escalated,
          avgResponseTimeMin: dayVal.responseTimeCount > 0 ? Math.round(dayVal.responseTimeSum / dayVal.responseTimeCount / 1000 / 60) : 0,
          avgResolutionTimeMin: dayVal.resolutionTimeCount > 0 ? Math.round(dayVal.resolutionTimeSum / dayVal.resolutionTimeCount / 1000 / 60) : 0,
        });
      } else {
        dailyData.push({
          date: dateStr,
          total: 0,
          resolved: 0,
          escalated: 0,
          avgResponseTimeMin: 0,
          avgResolutionTimeMin: 0,
        });
      }
    }

    const avgResponseTimeMin =
      responseTimeCount > 0
        ? Math.round(totalResponseTime / responseTimeCount / 1000 / 60)
        : 0;

    const avgResolutionTimeMin =
      resolutionTimeCount > 0
        ? Math.round(totalResolutionTime / resolutionTimeCount / 1000 / 60)
        : 0;

    const deflectionRate =
      resolvedCount + escalatedCount > 0
        ? Math.round((deflectionCount / (resolvedCount + escalatedCount)) * 100)
        : 0;

    const resolutionRate =
      totalConversations > 0
        ? Math.round((resolvedCount / totalConversations) * 100)
        : 0;

    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    const sentimentData = Object.entries(sentimentCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    return {
      kpis: {
        totalConversations,
        resolvedCount,
        escalatedCount,
        unresolvedCount,
        avgResponseTimeMin,
        avgResolutionTimeMin,
        deflectionRate,
        resolutionRate,
      },
      dailyData,
      categoryData,
      sentimentData,
      recentConversations,
    };
  },
});

export const backfillAnalytics = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect();

    let scheduledCount = 0;
    for (const conv of conversations) {
      if (
        (conv.status === "resolved" || conv.status === "escalated") &&
        (!conv.sentiment || !conv.category)
      ) {
        await ctx.scheduler.runAfter(0, internal.system.analytics.calculateMetricsAndGenerateInsights, {
          conversationId: conv._id,
        });
        scheduledCount++;
      }
    }

    return { scheduledCount };
  },
});

