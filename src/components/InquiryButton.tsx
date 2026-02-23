"use client";

import { useState } from "react";

type Phase = "idle" | "loading" | "replied";

const REPLY_TEXT = `日本英険検定協会サービスセンターです。
お問い合わせありがとうございます。

このたびのお問い合わせの件ですが、
昨今の民間英語検定試験は「英険」をはじめ、大学や高校の入試活用も進んでおり、その評価は合否に直結する公的な性格を帯びております。

したがいまして、答案の採点にあたっては、あらかじめ提示している「設問の要件」への準拠を含め、厳正かつ客観的な評価を厳密な審査体制のもとで行っております。

なお、個別の答案に対する採点理由の開示や、採点結果の変更には一切応じかねます。何卒ご了承ください。`;

const LOADING_DELAY_MS = 1500;

export default function InquiryButton() {
  const [phase, setPhase] = useState<Phase>("idle");

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("loading");
    setTimeout(() => setPhase("replied"), LOADING_DELAY_MS);
  };

  return (
    <div className="mb-8">
      <button
        onClick={handleClick}
        disabled={phase !== "idle"}
        className="text-sm px-4 py-2 border rounded transition-colors"
        style={{
          borderColor: phase === "idle" ? "var(--eiken-navy)" : "#999",
          color: phase === "idle" ? "var(--eiken-navy)" : "#999",
          cursor: phase === "idle" ? "pointer" : "default",
        }}
      >
        {phase === "idle" && "採点結果に関するお問い合わせ"}
        {phase === "loading" && (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            お問い合わせを受け付けました...
          </span>
        )}
        {phase === "replied" && "お問い合わせ済み"}
      </button>

      {phase === "replied" && (
        <div
          className="mt-3 p-4 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700 leading-relaxed animate-fade-in"
        >
          {REPLY_TEXT.split("\n").map((line, i) => (
            <p key={i} className={line === "" ? "h-3" : i > 0 ? "mt-1" : ""}>
              {line}
            </p>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
