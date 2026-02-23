# 英険1級 要約シュミレーター - Project Instructions

## Overview
英検1級「要約問題0点騒動」を風刺するジョークWebアプリ。
試験形式を本物に忠実に再現しつつ、採点ロジックが不条理であることがジョーク。
**「英険」は架空の検定であり、英検®とは無関係。**

## Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Gemini 2.5 Flash-Lite (`@google/generative-ai`)
- **Image**: html2canvas-pro (certificate PNG generation)
- **Hosting**: Vercel (Hobby plan, serverless)

## Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Header/Footer, fonts (Noto Sans JP, Noto Serif)
│   ├── page.tsx            # Exam page (test paper UI)
│   ├── result/page.tsx     # Result page (scores, certificate, share)
│   ├── globals.css         # CSS variables, exam-specific styles
│   └── api/score/route.ts  # Scoring API endpoint
├── components/
│   ├── Certificate.tsx     # Certificate (UnifrakturMaguntia font, forwardRef)
│   ├── ScoreTable.tsx      # 4-category score table (rowspan layout)
│   ├── ShareButton.tsx     # X share (Web Share API + fallback)
│   ├── InquiryButton.tsx   # Bureaucratic inquiry parody (joke mode only)
│   └── WordCounter.tsx     # Word count display
└── lib/
    ├── gemini.ts           # Gemini API wrapper (server-only, cached)
    ├── questions.ts        # 3 exam passages
    ├── rate-limit.ts       # Cookie + memory rate limiting (20/day)
    └── scoring.ts          # Word count gate + fancy word counter
```

## Scoring Logic (JOKE mode - default)
This is the core joke. DO NOT "fix" or "improve" this to be more fair.

1. **Word Count Gate**: 90-110語以外 = 即0点。範囲内でも確率的に0点
   - 100語 = 5%の確率で0点、90/110語 = 90%の確率で0点
2. **Grammar** (0-8): Gemini評価（文法のみ、内容は一切見ない）
3. **Content** (0-8): `8 - |wordCount - 100|`（語数の近さであり、内容ではない）
4. **Organization** (0-8): = grammar score（文法スコアのコピー）
5. **Vocabulary** (0-8): サーバー側で「高級語彙」の出現回数をカウント。重複OK
6. **0点時のフィードバック**: 実際の理由に関わらず「語数規定違反」と表示

## Scoring Logic (SERIOUS mode - settings toggle)
- Geminiが4項目すべてを真面目に採点
- 設定ギアアイコン → 「真面目に採点する」チェックで有効化

## Inquiry Button (bureaucratic parody)
- Result page has "採点結果に関するお問い合わせ" button (joke mode only)
- Click → 1.5s loading ("お問い合わせを受け付けました...") → template reply
- Reply mimics real Eiken Foundation's dismissive responses: "厳正かつ客観的な評価を厳密な審査体制のもとで行っております"
- One-shot interaction: button becomes "お問い合わせ済み" after use

## Key Design Decisions
- **ブラックボックス感がジョーク**: 特別なメッセージや演出は不要、淡々とスコアを出す
- **英検 → 英険**: 商標回避。検→険に変更。EIKEN→Eiken表記
- **Certificate**: UnifrakturMaguntia (blackletter) フォント。実物の英検合格証書に忠実
- **24点以上 = 合格**: 合格証明書をダウンロード可能
- **免責事項**: フッターに「英検®とは一切関係ありません」、証明書に「法的効力なし」

## Environment Variables
```
GEMINI_API_KEY=...          # Gemini API key (server-only)
RATE_LIMIT_SECRET=...       # HMAC signing secret for rate limit cookies
```

## Security Notes
- `gemini.ts` and `rate-limit.ts` use `server-only` import guard
- Rate limit: Cookie (HMAC-signed) + server-side memory counter, 20/day, JST reset
- Input validation: JSON type, size limit (16KB), answer length (4000 chars), origin check
- Gemini: maxOutputTokens=220, response cache (10min TTL)

## Development
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

## Deployment
```bash
# Deploy to Vercel (from /tmp/eiken-deploy or clean copy)
npx vercel --prod
# URL: https://eiken-summary-sim.vercel.app
```

## Conventions
- Code comments in English
- Commit messages in English
- UI text in Japanese
- Do not add unnecessary abstractions or over-engineer
- Maintain the joke nature of the app - do not make scoring "fair"
