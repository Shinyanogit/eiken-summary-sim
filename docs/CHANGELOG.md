# Changelog

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
  - Probability-based word count gate (100 words = 5% zero, 90/110 = 90% zero)
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
- Gemini: maxOutputTokens=220, JSON response mode, 10min response cache

### Infrastructure
- Deployed to Vercel: https://eiken-summary-sim.vercel.app
- Environment variables: GEMINI_API_KEY, RATE_LIMIT_SECRET
