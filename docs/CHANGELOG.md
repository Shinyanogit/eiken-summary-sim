# Changelog

## 2026-02-23 - UX Polish & Scoring Overhaul

### Features
- Result page now displays user's answer text
- Joke/serious mode toggle switch next to submit button
- "※ AIは真面目に採点しません。" disclaimer in joke mode
- Top page OG image (`/api/og-top`) with title and score preview cards
- SVG favicon (navy "4" badge)
- `metadataBase` set for absolute OG image URLs
- Sardonic feedback messages:
  - Gate survival: "おめでとうございます！あなたは語数フィルターを運良く突破しました！" (green bold)
  - In-range zero: "語数は規定範囲内ですが、総合的な判定により語数規定違反と判定されました"
  - Vocabulary report: highlighted in indigo bold
- Gemini feedback enforced to Japanese
- Certificate: fixed score table row alignment, text line breaks, year to 2026

### Scoring Changes
- Vocabulary: replaced hardcoded word list (~100 words) with AI identification
  - Gemini identifies advanced vocabulary → code counts actual occurrences → score
- Zero gate: step → quadratic → cubic → 5th-power curve
  - `pass = min((w-90)^5/1000, (110-w)^5/1000) %`
  - 100 words = safe, 99/101 = 59%, 95/105 = 3%, 90/110 = 0%

### Security
- Gemini 429 handled gracefully → 503 with user-friendly message
- Primary cost protection relies on Gemini API's own RPD quota

### Infrastructure
- Vercel project renamed: `eiken-deploy` → `eiken-summary-sim`
- Domain unified to `eiken-summary-sim.vercel.app`
- SSO Protection disabled for public access

---

## 2026-02-23 - OG Image Share System

### Features
- OG image API (`/api/og`): dynamically generates 1200x630 OGP images with scores
  - Edge runtime, Noto Sans JP Bold font from Google Fonts CDN
  - Cream background, navy border, 4-category score cards, total + pass/fail badge
- Share page (`/share`): server-rendered page with `generateMetadata` for OG tags
  - URL format: `/share?c=7&o=8&v=0&g=8`
  - Displays score table and "自分も挑戦する" CTA button
  - Twitter card: `summary_large_image` for rich link previews on X
- ShareButton now generates share URLs pointing to `/share` page with score params
  - X crawler fetches OG image from the share page's meta tags

---

## 2026-02-23 (v1.0) - Initial Release

### Features
- Exam page: faithful reproduction of Eiken Grade 1 summary writing test paper
  - Side-by-side layout on xl screens (passage left, answer right)
  - 3 exam passages (blood donation, AI employment, declining birth rate)
  - Word counter with out-of-range warning (red when outside 90-110)
  - Settings gear for serious mode toggle
- Result page: score display with 4-category table mimicking official Eiken format
  - Pass/fail badge (24+ = pass)
  - AI feedback display
  - Certificate generation for passing scores
  - X share button with #英険要約シュミレーター #英検 hashtags
- Joke scoring logic:
  - Probability-based word count gate (quadratic curve, 100 words = safe)
  - Content score = word count proximity (not actual content)
  - Organization = grammar copy
  - Vocabulary = server-side fancy word counting (duplicates OK)
  - Grammar = Gemini AI evaluation (only sane metric)
  - Zero feedback always claims "word count violation"
- Serious mode: Gemini evaluates all 4 categories properly
- Certificate component:
  - UnifrakturMaguntia blackletter font for "Certificate" title
  - Design faithful to real Eiken certificate (border, rosette, red logo, score table)
  - Name input field
  - PNG download via html2canvas-pro
  - Web Share API for mobile image sharing

### Security
- `server-only` import guard on gemini.ts and rate-limit.ts
- Rate limiting: HMAC-signed cookie + server-side memory counter (20/day, JST)
- Input validation: JSON type, 16KB size limit, 4000 char answer limit, origin check
- Timing-safe HMAC comparison
- Gemini: maxOutputTokens=350, JSON response mode, 10min response cache

### Infrastructure
- Deployed to Vercel: https://eiken-summary-sim.vercel.app
- Environment variables: GEMINI_API_KEY, RATE_LIMIT_SECRET
