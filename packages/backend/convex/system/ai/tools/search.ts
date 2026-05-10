import { openai } from "@ai-sdk/openai"
import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { generateText } from "ai";
import { internal } from "../../../_generated/api";
import { supportAgent } from "../agents/supportAgent";
import rag from "../rag"; 
import { SEARCH_INTERPRETER_PROMPT } from "../constants";

export const search = createTool({
  description: "Search the knowledge base for the relevant information to help answer user questions",
  inputSchema: z.object({
    query: z
      .string()
      .describe("The search query to find relevant information")
  }),
  execute: async (ctx, args) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId },
    );

    if (!conversation){
      return "No conversation found";
    }

    const orgId = conversation.organizationId;

    const searchResult = await rag.search(ctx, {
      namespace: orgId,
      query: args.query,
      limit: 5, 
    })

    const contextText = `Found results in ${searchResult.entries
      .map((e) => e.title || null)
      .filter((t)=> t !==null)
      .join(", ")}. Here is the context:\n\n${searchResult.text}`;

    const response = await generateText({
      messages: [
        {
          role: "system",
          content: SEARCH_INTERPRETER_PROMPT,
        },
        {
          role: "user",
          content: `User asked: "${args.query}"\n\nSearch results: ${contextText}`
        }
      ],
      model: openai("gpt-4o"),
    });

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: response.text,
      }
    });

    return response.text;

  }
})