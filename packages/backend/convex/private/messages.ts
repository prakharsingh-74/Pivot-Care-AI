import { ConvexError, convexToJson, v } from "convex/values";
import { action, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";

export const create = action({
    args: {
        prompt: v.string(),
        threadId: v.string(),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const contactSession = await ctx.runQuery(
            internal.system.contactSessions.getOne,
            {
                contactSessionId: args.contactSessionId,
            }
        );

        if (!contactSession || contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Session",
            });
        }

        const conversation = await ctx.runQuery(
            internal.system.conversations.getByThreadId,
            {
                threadId: args.threadId,
            }
        );

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found",
            });
        }


        if (conversation.status === "resolved"){
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Conversation is resolved",
            })
        }

        // TODO: Implement subscription check

        await supportAgent.generateText(
            ctx,
            { threadId: args.threadId },
            {
                prompt: args.prompt,
            }
        )
    }
});

export const getMany = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found",
            })
        }

        const orgId = identity.orgId as string;

        if (!orgId){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            })
        }

        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_thread_id", (q)=> q.eq("threadId", args.threadId))
            .unique();

        if (!conversation){
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found",
            })
        }

        if (conversation.organizationId !== orgId){
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization ID",
            })
        }
            
        const paginated = await supportAgent.listMessages(ctx, { 
            threadId: args.threadId,
            paginationOpts: args.paginationOpts,
    });

        return paginated;
    },
}); 