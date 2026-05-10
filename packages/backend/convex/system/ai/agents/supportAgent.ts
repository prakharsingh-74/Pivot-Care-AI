import { openai } from "@ai-sdk/openai";
import { Agent } from "@convex-dev/agent";
import { components } from "../../../_generated/api"

export const supportAgent = new Agent(components.agent,{
    name: "supportAgent",
    languageModel: openai("gpt-4o"),
    instructions: `You are a customer support agent. 
    ALWAYS search the knowledge base using the "search" tool before answering any question to provide accurate and specific information.
    Use "resolveConversation" tool when user expresses finalization of the conversation.
    Use "escalateConversation" tool when user expresses frustration or requests a human operator explicitly.`,
})