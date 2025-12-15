/**
 * AI Client - Cloudflare AI Gateway Integration
 *
 * This module provides a unified AI client that routes requests
 * through Cloudflare AI Gateway to various providers (OpenRouter, OpenAI, etc.)
 */

import OpenAI from "openai";
import { env } from "cloudflare:workers";

export type AIProvider = "openrouter" | "openai" | "anthropic" | "google";

export interface AIClientConfig {
  provider?: AIProvider;
  model?: string;
}

/**
 * Create an OpenAI-compatible client configured for Cloudflare AI Gateway
 */
export async function createAIClient(config?: AIClientConfig): Promise<OpenAI> {
  const gatewayId = env.AI_GATEWAY_ID;
  if (!gatewayId) {
    throw new Error("AI_GATEWAY_ID is not configured");
  }

  const provider = config?.provider || env.AI_PROVIDER || "openrouter";

  // Dynamic URL resolution via Cloudflare AI binding
  const baseURL = await env.AI.gateway(gatewayId).getUrl(provider);

  return new OpenAI({
    apiKey: env.CLOUDFLARE_API_TOKEN, // OpenAI API key
    baseURL: baseURL,
  });
}

/**
 * Get the default model from environment
 */
export function getDefaultModel(): string {
  return env.AI_MODEL || "google/gemini-2.5-flash";
}
