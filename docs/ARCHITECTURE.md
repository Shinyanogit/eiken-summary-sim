# Architecture

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| AI | Gemini 2.5 Flash-Lite |
| Image Gen | html2canvas-pro, next/og (ImageResponse) |
| Hosting | Vercel (Hobby) |
| Font | Noto Sans JP, Noto Serif, UnifrakturMaguntia |

## Data Flow

```
[User] → page.tsx (exam UI)
         ↓ POST /api/score { answer, questionId, serious }
[API Route] → Input validation (JSON, size, type, origin)
            → Rate limit check (cookie + memory, 20/day)
            → Word count gate (joke mode only)
            → Gemini API call (grammar + fancy word identification)
            → Code counts AI-identified fancy words → vocabulary score
            → Score composition
            ↓ Response { content, organization, vocabulary, grammar, feedback, wordCount }
[User] → sessionStorage (result + answer) → result/page.tsx
         → Answer display, ScoreTable, Feedback, Certificate (if passed), ShareButton
```

## Server-Side Components

### API Route (`/api/score`)
Single POST endpoint. All scoring logic runs server-side.

### Gemini Integration (`lib/gemini.ts`)
- `server-only` guarded
- Two prompts: JOKE (grammar + fancy word identification) and SERIOUS (4-category)
- JOKE prompt returns `{ grammar, fancyWords: string[], feedback }`
- Response cache: SHA-256 keyed, 10min TTL, max 300 entries
- maxOutputTokens: 350, JSON response mode

### Rate Limiting (`lib/rate-limit.ts`)
- `server-only` guarded
- Dual-layer: HMAC-signed cookie + server-side memory Map
- Fingerprint: SHA-256 of IP + User-Agent
- Daily reset at JST midnight
- `consumeRateLimit()`: atomic check + increment

### Scoring (`lib/scoring.ts`)
- `countWords()`: whitespace split
- `checkWordCountGate()`: 5th-power probability zero gate — `pass = min((w-90)^5/1000, (110-w)^5/1000) %`
- In-range zero: sardonic "規定範囲内ですが総合的な判定により語数規定違反" message
- Gate survival: congratulatory "語数フィルターを運良く突破しました！" message
- `makeZeroScore()`: generates fake "word count violation" feedback
- Vocabulary scoring in route.ts: counts AI-identified fancy words from Gemini response

### Error Handling
- Gemini 429 (rate limit) → propagated as 503 with user-friendly message
- Other Gemini errors → silent fallback to 0-score

### OG Image API (`/api/og`)
- Edge runtime, `next/og` ImageResponse
- Query params: `c`, `o`, `v`, `g` (each 0-8, clamped)
- Generates 1200x630px PNG with score cards and pass/fail badge
- Font: Noto Sans JP Bold (fetched from CDN, graceful fallback to sans-serif)

### Share Page (`/share`)
- Server component with `generateMetadata` for dynamic OG/Twitter meta tags
- Points `og:image` and `twitter:image` to `/api/og?c=...&o=...&v=...&g=...`
- Renders score summary with link to home page

## Client-Side Components

### Certificate (`Certificate.tsx`)
- `forwardRef` with `CertificateHandle` (exposes `toBlob()`)
- Loads UnifrakturMaguntia via dynamic `<link>` injection
- html2canvas-pro for PNG generation
- Design matches real Eiken certificate (border, colors, layout)

### ShareButton (`ShareButton.tsx`)
- Generates share URL: `/share?c=X&o=X&v=X&g=X` (OGP-enabled page)
- Synchronous `canShareFiles()` check (prevents async popup block)
- Mobile: Web Share API with certificate PNG
- PC: `about:blank` window pre-opened → X intent URL fallback
- AbortError (user cancel) handled gracefully

### Top Page OG Image (`/api/og-top`)
- Edge runtime, static OG image for homepage
- Title, tagline "あなたは0点を回避できるか？", score preview cards with "?"

## Environment Variables
| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Gemini API authentication | Yes |
| `RATE_LIMIT_SECRET` | HMAC signing for rate limit cookies | Yes (auto-generated if missing) |

## Cost & Security Model
- Gemini 2.5 Flash-Lite: ~$0.00007/request
- Rate limit: cookie + memory-based (20/day), bypassable in incognito
- Primary cost protection: Gemini API's own RPD quota (project-level)
- Response cache (SHA-256, 10min TTL) reduces duplicate calls
- Vercel Hobby: free (serverless functions included)
