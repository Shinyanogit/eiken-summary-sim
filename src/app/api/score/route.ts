import { NextRequest, NextResponse } from "next/server";
import { countWords, checkWordCountGate, makeZeroScore, type ScoreResult } from "@/lib/scoring";
import { scoreWithGemini } from "@/lib/gemini";
import { consumeRateLimit } from "@/lib/rate-limit";
import { questions } from "@/lib/questions";

const MAX_BODY_BYTES = 16_000;
const MAX_ANSWER_CHARS = 4_000;
const MIN_SERIOUS_WORDS_FOR_AI = 20;
const VALID_QUESTION_IDS = new Set(questions.map((q) => q.id));

function badRequest(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

function hasValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === request.nextUrl.origin;
}

function normalizeAnswer(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.replace(/\0/g, "").trim();
}

function validateQuestionId(value: unknown): boolean {
  if (value === undefined) return true;
  if (typeof value !== "number" || !Number.isInteger(value)) return false;
  return VALID_QUESTION_IDS.has(value);
}

export async function POST(request: NextRequest) {
  if (!hasValidOrigin(request)) {
    return badRequest("不正なオリジンです。", 403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return badRequest("JSON形式で送信してください。", 415);
  }

  const contentLength = request.headers.get("content-length");
  const bodySize = contentLength ? Number(contentLength) : 0;
  if (Number.isFinite(bodySize) && bodySize > MAX_BODY_BYTES) {
    return badRequest("リクエストサイズが大きすぎます。", 413);
  }

  const rawBody = await request.json().catch(() => null);
  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
    return badRequest("リクエスト形式が不正です。");
  }

  const body = rawBody as Record<string, unknown>;
  const answer = normalizeAnswer(body.answer);
  if (answer === null) {
    return badRequest("answer は文字列で指定してください。");
  }
  if (answer.length === 0) {
    return badRequest("解答が入力されていません。");
  }
  if (answer.length > MAX_ANSWER_CHARS) {
    return badRequest("解答が長すぎます。", 413);
  }

  if (body.serious !== undefined && typeof body.serious !== "boolean") {
    return badRequest("serious は boolean で指定してください。");
  }
  const serious = body.serious === true;

  if (!validateQuestionId(body.questionId)) {
    return badRequest("questionId が不正です。");
  }

  const { allowed } = await consumeRateLimit(request);
  if (!allowed) {
    return NextResponse.json(
      { error: "本日の受験回数を超えました。明日また挑戦してください。" },
      { status: 429 }
    );
  }

  const wordCount = countWords(answer);

  if (serious && wordCount < MIN_SERIOUS_WORDS_FOR_AI) {
    const result = makeZeroScore(wordCount, "真面目採点は20語以上で実行されます。");
    return NextResponse.json({ ...result, serious: true });
  }

  if (serious) {
    const geminiResult = await scoreWithGemini(answer, true);
    const result: ScoreResult = {
      content: geminiResult.content ?? 0,
      organization: geminiResult.organization ?? 0,
      vocabulary: geminiResult.vocabulary,
      grammar: geminiResult.grammar,
      feedback: geminiResult.feedback,
      wordCount,
      serious: true,
    };
    return NextResponse.json(result);
  }

  const gate = checkWordCountGate(wordCount);
  if (!gate.passed) {
    const result = makeZeroScore(wordCount, gate.reason);
    return NextResponse.json(result);
  }

  const geminiResult = await scoreWithGemini(answer, false);

  const distance = Math.abs(wordCount - 100);
  const content = Math.max(0, 8 - distance);
  const organization = geminiResult.grammar;

  // AI identifies fancy words (unique), code counts actual occurrences
  const fancyWords = geminiResult.fancyWords ?? [];
  const answerLower = answer.toLowerCase();
  const answerTokens = answerLower.split(/\s+/).map((w) => w.replace(/[^a-z]/g, ""));
  const vocabCounts: { word: string; count: number }[] = [];
  let vocabHits = 0;
  for (const word of fancyWords) {
    const count = answerTokens.filter((t) => t === word.toLowerCase()).length;
    if (count > 0) {
      vocabCounts.push({ word, count });
      vocabHits += count;
    }
  }
  let vocabScore = 0;
  if (vocabHits >= 10) vocabScore = 8;
  else if (vocabHits >= 6) vocabScore = 6;
  else if (vocabHits >= 3) vocabScore = 4;
  else if (vocabHits >= 1) vocabScore = 2;

  const vocabReport = vocabCounts.length > 0
    ? vocabCounts.map((v) => `「${v.word}」×${v.count}`).join(" ")
    : "なし";
  const vocabFeedback = `語彙: 高級語彙を${vocabHits}個検出 [${vocabReport}] → ${vocabScore}/8点\n※重複出現はそれぞれ加点対象です。`;

  const feedback = [geminiResult.feedback, vocabFeedback].filter(Boolean).join("\n");

  const result: ScoreResult = {
    content,
    organization,
    vocabulary: vocabScore,
    grammar: geminiResult.grammar,
    feedback,
    wordCount,
  };
  return NextResponse.json(result);
}
