import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { supportAgent } from "./ai/agents/supportAgent";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export const calculateMetricsAndGenerateInsights = internalAction({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch conversation details
    const conversation = await ctx.runQuery(internal.system.conversations.getOneInternal, {
      conversationId: args.conversationId,
    });
    if (!conversation) {
      console.error("Conversation not found:", args.conversationId);
      return;
    }

    // 2. Fetch messages in the thread
    let messages;
    try {
      messages = await supportAgent.listMessages(ctx, {
        threadId: conversation.threadId,
        paginationOpts: { numItems: 500, cursor: null },
      });
    } catch (err) {
      console.error("Failed to list messages for thread:", conversation.threadId, err);
      return;
    }

    const sortedMessages = [...messages.page].sort((a, b) => a._creationTime - b._creationTime);

    // Calculate First Response Time (FRT)
    // The greeting sent in public/conversations.ts:create is at the very beginning (role assistant).
    // The customer sends their first message (role user) after that.
    // The first response time is the duration between the first customer message (role user) 
    // and the subsequent assistant response (role assistant).
    let firstUserMsgTime = 0;
    let firstAssistantMsgTimeAfterUser = 0;

    for (const msg of sortedMessages) {
      if (msg.message?.role === "user" && firstUserMsgTime === 0) {
        firstUserMsgTime = msg._creationTime;
      } else if (
        msg.message?.role === "assistant" &&
        firstUserMsgTime !== 0 &&
        firstAssistantMsgTimeAfterUser === 0
      ) {
        firstAssistantMsgTimeAfterUser = msg._creationTime;
      }
    }

    let firstResponseTime: number | undefined;
    if (firstUserMsgTime > 0 && firstAssistantMsgTimeAfterUser > 0) {
      firstResponseTime = firstAssistantMsgTimeAfterUser - firstUserMsgTime;
    }

    // Calculate Resolution Time
    let resolutionTime: number | undefined;
    let resolvedAt: number | undefined;
    if (conversation.status === "resolved") {
      resolvedAt = Date.now();
      resolutionTime = resolvedAt - conversation._creationTime;
    }

    let escalatedAt: number | undefined;
    let wasEscalated: boolean | undefined;
    if (conversation.status === "escalated") {
      escalatedAt = Date.now();
      wasEscalated = true;
    }

    // 3. Generate AI insights (Sentiment, Category, Summary)
    let sentiment: "positive" | "neutral" | "negative" | "mixed" | undefined;
    let category: string | undefined;
    let summary: string | undefined;

    const hasUserMessages = sortedMessages.some((msg) => msg.message?.role === "user");

    if (hasUserMessages) {
      try {
        const transcript = sortedMessages
          .filter((msg) => msg.message !== undefined)
          .map((msg) => `${msg.message!.role === "user" ? "Customer" : "Agent"}: ${msg.message!.content}`)
          .join("\n");

        const prompt = `Analyze the following customer support conversation transcript.
Provide:
1. Sentiment of the customer: choose exactly one of "positive", "neutral", "negative", or "mixed".
2. Category of the conversation (e.g., "Billing", "Technical Bug", "Feature Request", "General Inquiry", "Product Question", "Other").
3. A concise 1-sentence summary of the conversation.

Format your output strictly as a JSON object with keys: "sentiment", "category", and "summary". Do not include any markdown format (like \`\`\`json) in your response.

Transcript:
${transcript}`;

        const response = await generateText({
          model: openai("gpt-4o"),
          prompt,
        });

        const parsed = JSON.parse(response.text.trim());
        if (
          parsed.sentiment === "positive" ||
          parsed.sentiment === "neutral" ||
          parsed.sentiment === "negative" ||
          parsed.sentiment === "mixed"
        ) {
          sentiment = parsed.sentiment;
        }
        category = parsed.category || "General Inquiry";
        summary = parsed.summary || "No summary generated.";
      } catch (err) {
        console.error("Failed to generate AI insights via OpenAI:", err);
        sentiment = "neutral";
        category = "General Inquiry";
        summary = "AI analysis failed; metrics calculated.";
      }
    } else {
      sentiment = "neutral";
      category = "General Inquiry";
      summary = "No customer messages received.";
    }

    // 4. Update the conversation record in the database
    const updateFields: any = {
      conversationId: args.conversationId,
    };

    if (firstResponseTime !== undefined) updateFields.firstResponseTime = firstResponseTime;
    if (resolutionTime !== undefined) {
      updateFields.resolutionTime = resolutionTime;
      updateFields.resolvedAt = resolvedAt;
    }
    if (wasEscalated !== undefined) {
      updateFields.wasEscalated = wasEscalated;
      updateFields.escalatedAt = escalatedAt;
    }
    if (sentiment) updateFields.sentiment = sentiment;
    if (category) updateFields.category = category;
    if (summary) updateFields.summary = summary;

    await ctx.runMutation(internal.system.conversations.updateMetricsAndInsights, updateFields);
  },
});
