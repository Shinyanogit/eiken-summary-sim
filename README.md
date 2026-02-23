# 英険1級 要約シュミレーター

英検1級「要約問題0点騒動」を風刺するジョークWebアプリ。試験形式を本物に忠実に再現しつつ、採点ロジックが不条理であることがジョーク。

> **「英険」は架空の検定であり、英検®とは一切関係ありません。**

## Live Demo

[https://eiken-summary-sim.vercel.app](https://eiken-summary-sim.vercel.app)

## Tech Stack

- **Framework**: Next.js (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Gemini 2.5 Flash-Lite (`@google/generative-ai`)
- **Image**: html2canvas-pro (certificate PNG generation)
- **Hosting**: Vercel

## Features

- 英検1級の要約問題を再現した試験UI
- Gemini AIによる文法採点
- 不条理な採点ロジック（ジョークモード）
- 真面目な採点モード（設定から切り替え可能）
- 合格証明書の生成・ダウンロード
- X (Twitter) シェア機能
- レート制限 (20回/日)

## Development

```bash
npm install
npm run dev
```

## Environment Variables

```
GEMINI_API_KEY=...          # Gemini API key
RATE_LIMIT_SECRET=...       # HMAC signing secret for rate limit cookies
```

## License

MIT
