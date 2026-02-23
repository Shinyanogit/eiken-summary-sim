import "server-only";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.5-flash-lite";
const MAX_OUTPUT_TOKENS = 350;
const MAX_FEEDBACK_CHARS = 700;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 300;

interface GeminiScoreResponse {
  grammar: number;
  vocabulary: number;
  feedback: string;
  fancyWords?: string[];
}

interface CachedValue {
  expiresAt: number;
  value: GeminiScoreResponse & { content?: number; organization?: number; fancyWords?: string[] };
}

type ScoreCache = Map<string, CachedValue>;

declare global {
  var __EIKEN_GEMINI_CACHE__: ScoreCache | undefined;
}

const responseCache: ScoreCache = globalThis.__EIKEN_GEMINI_CACHE__ ?? new Map();
if (!globalThis.__EIKEN_GEMINI_CACHE__) {
  globalThis.__EIKEN_GEMINI_CACHE__ = responseCache;
}

const JOKE_PROMPT = [
  "You are a parody English grader.",
  "Score ONLY grammar from 0 to 8.",
  "Ignore topic relevance, repetition, and meaning.",
  "Also list every advanced/sophisticated vocabulary word (英検準1級〜1級レベル) found in the text.",
  "Include words like: however, therefore, significant, contribute, phenomenon, implement, facilitate, comprehensive, etc.",
  "Do NOT include basic words (is, have, make, good, bad, important, etc.).",
  "Return each word exactly as it appears in the text (preserve original form).",
  "Write Japanese feedback in exactly 2 lines separated by \\n:",
  "Line1: grammar finding.",
  "Line2: note that content relevance is not graded.",
  "Return JSON only: {\"grammar\": number, \"fancyWords\": string[], \"feedback\": string}",
].join("\n");

const SERIOUS_PROMPT = [
  "Evaluate this English summary.",
  "Return integer scores (0-8): grammar, vocabulary, content, organization.",
  "Also return Japanese feedback in 1-2 sentences.",
  "Return JSON only:",
  "{\"grammar\":number,\"vocabulary\":number,\"content\":number,\"organization\":number,\"feedback\":string}",
].join("\n");

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
}

function toScore(value: unknown): number {
  const num = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(num)) return 0;
  return Math.min(8, Math.max(0, Math.round(num)));
}

function sanitizeFeedback(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").slice(0, MAX_FEEDBACK_CHARS);
}

function makeCacheKey(answer: string, serious: boolean): string {
  const normalized = answer.trim().replace(/\s+/g, " ");
  return crypto.createHash("sha256").update(`${serious ? "1" : "0"}:${normalized}`).digest("hex");
}

function pruneCache(now: number): void {
  for (const [key, cached] of responseCache) {
    if (cached.expiresAt <= now) {
      responseCache.delete(key);
    }
  }
  while (responseCache.size > CACHE_MAX_ENTRIES) {
    const oldestKey = responseCache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    responseCache.delete(oldestKey);
  }
}

export async function scoreWithGemini(
  answer: string,
  serious: boolean = false
): Promise<GeminiScoreResponse & { content?: number; organization?: number }> {
  const now = Date.now();
  pruneCache(now);

  const cacheKey = makeCacheKey(answer, serious);
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const prompt = `${serious ? SERIOUS_PROMPT : JOKE_PROMPT}\n\nText:\n${answer}`;

  try {
    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: serious ? 0.2 : 0.4,
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text().trim();
    const jsonText = text.startsWith("{") ? text : text.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonText) {
      throw new Error("No JSON found in Gemini response");
    }

    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    const fancyWords = !serious && Array.isArray(parsed.fancyWords)
      ? (parsed.fancyWords as unknown[]).filter((w): w is string => typeof w === "string")
      : undefined;
    const response = {
      grammar: toScore(parsed.grammar),
      vocabulary: serious ? toScore(parsed.vocabulary) : 0,
      feedback: sanitizeFeedback(parsed.feedback),
      ...(fancyWords && { fancyWords }),
      ...(serious && {
        content: toScore(parsed.content),
        organization: toScore(parsed.organization),
      }),
    };

    responseCache.set(cacheKey, {
      expiresAt: now + CACHE_TTL_MS,
      value: response,
    });

    return response;
  } catch (e: unknown) {
    const status = (e as { status?: number })?.status
      ?? (e as { httpStatusCode?: number })?.httpStatusCode;
    if (status === 429) {
      const err = new Error("RATE_LIMITED");
      (err as Error & { status: number }).status = 429;
      throw err;
    }
    return {
      grammar: 0,
      vocabulary: 0,
      feedback: "採点処理中にエラーが発生しました。",
      ...(serious && { content: 0, organization: 0 }),
    };
  }
}
