"use client";

import { useEffect, useState, useRef } from "react";
import ScoreTable from "@/components/ScoreTable";
import ShareButton from "@/components/ShareButton";
import Certificate, { type CertificateHandle } from "@/components/Certificate";

interface Result {
  content: number;
  organization: number;
  vocabulary: number;
  grammar: number;
  feedback: string;
  wordCount: number;
  serious?: boolean;
}

const PASS_THRESHOLD = 24;

export default function ResultPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [name, setName] = useState("");
  const certRef = useRef<CertificateHandle>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("eiken_result");
    if (stored) {
      setResult(JSON.parse(stored));
    }
  }, []);

  if (!result) {
    return (
      <div className="bg-white border border-gray-200 p-8 text-center">
        <p className="text-gray-500">結果データがありません。</p>
        <a
          href="/"
          className="inline-block mt-4 px-5 py-2 text-white text-sm rounded"
          style={{ background: "var(--eiken-navy)" }}
        >
          試験に戻る
        </a>
      </div>
    );
  }

  const total = result.content + result.organization + result.vocabulary + result.grammar;
  const passed = total >= PASS_THRESHOLD;
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white border border-gray-200 p-8 md:p-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <a href="/" className="hover:underline" style={{ color: "var(--eiken-navy)" }}>
          ホーム
        </a>
        <span className="mx-2">&gt;</span>
        <span>採点結果</span>
      </div>

      <h1
        className="text-xl font-bold mb-2 pb-3 border-b-2"
        style={{ borderColor: "var(--eiken-navy)", color: "var(--eiken-navy)" }}
      >
        採点結果
      </h1>

      <p className="text-sm text-gray-500 mb-2">語数: {result.wordCount} words</p>

      {/* Pass/Fail badge */}
      <div className="mb-6">
        {passed ? (
          <span className="inline-block px-4 py-1 text-sm font-bold rounded bg-amber-100 text-amber-800 border border-amber-300">
            合格（{total}/32点）
          </span>
        ) : (
          <span className="inline-block px-4 py-1 text-sm font-bold rounded bg-gray-100 text-gray-600 border border-gray-300">
            不合格（{total}/32点）
          </span>
        )}
      </div>

      {/* Score Table */}
      <div className="mb-8">
        <ScoreTable
          content={result.content}
          organization={result.organization}
          vocabulary={result.vocabulary}
          grammar={result.grammar}
          serious={result.serious}
        />
      </div>

      {/* Feedback */}
      {result.feedback && (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 leading-relaxed">
          <div className="font-medium mb-1 text-gray-900">フィードバック</div>
          {result.feedback.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>
          ))}
        </div>
      )}

      {/* Certificate (pass only) */}
      {passed && (
        <div className="mb-8">
          <div className="mb-4 max-w-[620px] mx-auto">
            <label className="block text-sm text-gray-600 mb-1">証明書に記載する名前（任意）</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <Certificate
            ref={certRef}
            name={name}
            content={result.content}
            organization={result.organization}
            vocabulary={result.vocabulary}
            grammar={result.grammar}
            total={total}
            date={today}
          />
        </div>
      )}

      {/* Joke disclaimer */}
      {!result.serious && (
        <p className="text-xs text-gray-400 mb-6">
          ※ この採点はジョークです。実際の英検の採点基準とは一切関係ありません。
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <ShareButton score={total} passed={passed} certRef={certRef} />
        <a
          href="/"
          className="inline-flex items-center px-5 py-2.5 border text-sm rounded hover:bg-gray-50 transition-colors"
          style={{ borderColor: "var(--eiken-navy)", color: "var(--eiken-navy)" }}
        >
          もう一度挑戦する
        </a>
      </div>
    </div>
  );
}
