import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";

export const getOneInternal = internalQuery({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.conversationId);
    },
});

export const escalate = internalMutation({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_thread_id", ( q ) => q.eq("threadId", args.threadId))
            .unique();
        if (!conversation){
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found",
            });
        }
        await ctx.db.patch(conversation._id, {
            status: "escalated",
        });
        // Schedule metrics calculation and insights generation
        await ctx.scheduler.runAfter(0, internal.system.analytics.calculateMetricsAndGenerateInsights, {
            conversationId: conversation._id,
        });
    },
});

export const resolve = internalMutation({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_thread_id", ( q ) => q.eq("threadId", args.threadId))
            .unique();
        if (!conversation){
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found",
            });
        }
        await ctx.db.patch(conversation._id, {
            status: "resolved",
        });
        // Schedule metrics calculation and insights generation
        await ctx.scheduler.runAfter(0, internal.system.analytics.calculateMetricsAndGenerateInsights, {
            conversationId: conversation._id,
        });
    },
});

export const getByThreadId = internalQuery({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_thread_id", ( q ) => q.eq("threadId", args.threadId))
            .unique();

        return conversation;
    },
});

export const updateMetricsAndInsights = internalMutation({
    args: {
        conversationId: v.id("conversations"),
        wasEscalated: v.optional(v.boolean()),
        escalatedAt: v.optional(v.number()),
        resolvedAt: v.optional(v.number()),
        firstResponseTime: v.optional(v.number()),
        resolutionTime: v.optional(v.number()),
        sentiment: v.optional(v.union(
            v.literal("positive"),
            v.literal("neutral"),
            v.literal("negative"),
            v.literal("mixed")
        )),
        category: v.optional(v.string()),
        summary: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { conversationId, ...fields } = args;
        await ctx.db.patch(conversationId, fields);
    },
});
