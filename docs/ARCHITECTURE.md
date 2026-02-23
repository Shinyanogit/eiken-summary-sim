# Architecture

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| AI | Gemini 2.5 Flash-Lite |
| Image Gen | html2canvas-pro |
| Hosting | Vercel (Hobby) |
| Font | Noto Sans JP, Noto Serif, UnifrakturMaguntia |

## Data Flow

```
[User] → page.tsx (exam UI)
         ↓ POST /api/score { answer, questionId, serious }
[API Route] → Input validation (JSON, size, type, origin)
            → Rate limit check (cookie + memory, 20/day)
            → Word count gate (joke mode only)
            → Gemini API call (grammar scoring)
            → Server-side fancy word counting
            → Score composition
            ↓ Response { content, organization, vocabulary, grammar, feedback, wordCount }
[User] → sessionStorage → result/page.tsx
         → ScoreTable, Feedback, Certificate (if passed), ShareButton
```

## Server-Side Components

### API Route (`/api/score`)
Single POST endpoint. All scoring logic runs server-side.

### Gemini Integration (`lib/gemini.ts`)
- `server-only` guarded
- Two prompts: JOKE (grammar only) and SERIOUS (4-category)
- Response cache: SHA-256 keyed, 10min TTL, max 300 entries
- maxOutputTokens: 220, JSON response mode

### Rate Limiting (`lib/rate-limit.ts`)
- `server-only` guarded
- Dual-layer: HMAC-signed cookie + server-side memory Map
- Fingerprint: SHA-256 of IP + User-Agent
- Daily reset at JST midnight
- `consumeRateLimit()`: atomic check + increment

### Scoring (`lib/scoring.ts`)
- `countWords()`: whitespace split
- `checkWordCountGate()`: probability-based zero gate
- `countFancyWords()`: server-side, duplicates counted, ~60 word list
- `makeZeroScore()`: generates fake "word count violation" feedback

## Client-Side Components

### Certificate (`Certificate.tsx`)
- `forwardRef` with `CertificateHandle` (exposes `toBlob()`)
- Loads UnifrakturMaguntia via dynamic `<link>` injection
- html2canvas-pro for PNG generation
- Design matches real Eiken certificate (border, colors, layout)

### ShareButton (`ShareButton.tsx`)
- Synchronous `canShareFiles()` check (prevents async popup block)
- Mobile: Web Share API with certificate PNG
- PC: `about:blank` window pre-opened → X intent URL fallback
- AbortError (user cancel) handled gracefully

## Environment Variables
| Variable | Purpose | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | Gemini API authentication | Yes |
| `RATE_LIMIT_SECRET` | HMAC signing for rate limit cookies | Yes (auto-generated if missing) |

## Cost Model
- Gemini 2.5 Flash-Lite: ~$0.00007/request
- Rate limit: 20 requests/user/day
- Response cache reduces duplicate calls
- Vercel Hobby: free (serverless functions included)
