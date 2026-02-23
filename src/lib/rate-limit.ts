import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const MAX_SUBMISSIONS = 20;
const COOKIE_NAME = "eiken_sim";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;
const RATE_LIMIT_SECRET = process.env.RATE_LIMIT_SECRET ?? crypto.randomBytes(32).toString("hex");

interface RateLimitData {
  count: number;
  date: string; // YYYY-MM-DD in JST
  fingerprint: string;
}

type RateLimitStore = Map<string, RateLimitData>;

declare global {
  var __EIKEN_RATE_LIMIT_STORE__: RateLimitStore | undefined;
}

const memoryStore: RateLimitStore = globalThis.__EIKEN_RATE_LIMIT_STORE__ ?? new Map();
if (!globalThis.__EIKEN_RATE_LIMIT_STORE__) {
  globalThis.__EIKEN_RATE_LIMIT_STORE__ = memoryStore;
}

function getTodayJST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
  }).format(new Date());
}

function getClientFingerprint(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const ip = forwardedFor || realIp || "unknown-ip";
  const userAgent = request.headers.get("user-agent") ?? "unknown-ua";
  return crypto.createHash("sha256").update(`${ip}|${userAgent}`).digest("hex").slice(0, 24);
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", RATE_LIMIT_SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function parseCookieData(raw: string | undefined, today: string, fingerprint: string): RateLimitData | null {
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;

  try {
    const decoded = Buffer.from(encoded, "base64url").toString("utf-8");
    const expectedSig = sign(decoded);
    if (!safeEqual(sig, expectedSig)) return null;

    const parsed = JSON.parse(decoded) as Partial<RateLimitData>;
    if (typeof parsed.count !== "number" || !Number.isInteger(parsed.count) || parsed.count < 0) {
      return null;
    }
    if (parsed.date !== today) return null;
    if (parsed.fingerprint !== fingerprint) return null;

    return {
      count: Math.min(MAX_SUBMISSIONS, parsed.count),
      date: parsed.date,
      fingerprint: parsed.fingerprint,
    };
  } catch {
    return null;
  }
}

function pruneMemoryStore(today: string): void {
  for (const [key, value] of memoryStore) {
    if (value.date !== today) {
      memoryStore.delete(key);
    }
  }
}

function getMemoryData(key: string, today: string): RateLimitData | null {
  const data = memoryStore.get(key);
  if (!data) return null;
  if (data.date !== today) {
    memoryStore.delete(key);
    return null;
  }
  return data;
}

async function getCurrentCount(request: NextRequest): Promise<{ count: number; today: string; fingerprint: string }> {
  const today = getTodayJST();
  pruneMemoryStore(today);

  const fingerprint = getClientFingerprint(request);
  const key = `${today}:${fingerprint}`;
  const cookieStore = await cookies();
  const cookieRaw = cookieStore.get(COOKIE_NAME)?.value;

  const cookieData = parseCookieData(cookieRaw, today, fingerprint);
  const memoryData = getMemoryData(key, today);

  const cookieCount = cookieData?.count ?? 0;
  const memoryCount = memoryData?.count ?? 0;
  return {
    count: Math.max(cookieCount, memoryCount),
    today,
    fingerprint,
  };
}

async function persistCount(request: NextRequest, count: number, today: string, fingerprint: string): Promise<void> {
  const safeCount = Math.min(MAX_SUBMISSIONS, Math.max(0, count));
  const key = `${today}:${fingerprint}`;

  memoryStore.set(key, {
    count: safeCount,
    date: today,
    fingerprint,
  });

  const cookieStore = await cookies();
  const data = JSON.stringify({ count: safeCount, date: today, fingerprint });
  const encoded = Buffer.from(data, "utf-8").toString("base64url");
  const sig = sign(data);

  cookieStore.set(COOKIE_NAME, `${encoded}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function checkRateLimit(request: NextRequest): Promise<{ allowed: boolean; remaining: number }> {
  const { count } = await getCurrentCount(request);
  if (count >= MAX_SUBMISSIONS) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: MAX_SUBMISSIONS - count };
}

export async function incrementRateLimit(request: NextRequest): Promise<void> {
  const { count, today, fingerprint } = await getCurrentCount(request);
  await persistCount(request, count + 1, today, fingerprint);
}

export async function consumeRateLimit(request: NextRequest): Promise<{ allowed: boolean; remaining: number }> {
  const { count, today, fingerprint } = await getCurrentCount(request);
  if (count >= MAX_SUBMISSIONS) {
    return { allowed: false, remaining: 0 };
  }
  const nextCount = count + 1;
  await persistCount(request, nextCount, today, fingerprint);
  return { allowed: true, remaining: MAX_SUBMISSIONS - nextCount };
}
