"use client";

import { useState, useEffect } from "react";
import WordCounter from "@/components/WordCounter";
import { questions, type Question } from "@/lib/questions";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

export default function TestPage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [seriousMode, setSeriousMode] = useState(false);

  useEffect(() => {
    const q = questions[Math.floor(Math.random() * questions.length)];
    setQuestion(q);
  }, []);

  const wordCount = countWords(answer);

  async function handleSubmit() {
    if (wordCount === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, questionId: question?.id, serious: seriousMode }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "エラーが発生しました。");
        setSubmitting(false);
        return;
      }
      sessionStorage.setItem("eiken_result", JSON.stringify(data));
      sessionStorage.setItem("eiken_answer", answer);
      window.location.href = "/result";
    } catch {
      alert("通信エラーが発生しました。");
      setSubmitting(false);
    }
  }

  if (!question) return null;

  return (
    <div className="bg-white border border-gray-200 p-6 md:p-10 relative">
      {/* Settings gear */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        title="設定"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {showSettings && (
        <div className="absolute top-12 right-4 bg-white border border-gray-200 shadow-lg rounded p-4 z-10 w-64">
          <div className="text-sm font-medium text-gray-700 mb-3">採点設定</div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={seriousMode}
              onChange={(e) => setSeriousMode(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">真面目に採点する</span>
          </label>
          <p className="text-xs text-gray-400 mt-2">
            ONにすると語数ゲートを無効化し、4観点すべてをAIが真面目に採点します。
          </p>
        </div>
      )}

      {/* Grade label */}
      <div className="text-sm text-gray-600 mb-4">Grade 1</div>

      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-black text-white w-10 h-10 flex items-center justify-center text-xl italic exam-serif font-bold">
          4
        </div>
        <h1 className="text-2xl font-bold exam-serif">English Summary</h1>
      </div>

      {/* Red notice bar */}
      <div
        className="text-white text-sm text-center py-2 px-4 mb-6 rounded-sm"
        style={{ background: "var(--eiken-red)" }}
      >
        The writing section consists of two tasks (
        <span className="inline-block border border-white px-1 text-xs mx-0.5">4</span>
        {" "}and{" "}
        <span className="inline-block border border-white px-1 text-xs mx-0.5">5</span>
        ). Please remember to complete both tasks.
        <br />
        Write your summary in answer box{" "}
        <span className="inline-block border border-white px-1 text-xs mx-0.5">4</span>
        {" "}English Summary on Side A of your answer sheet.
      </div>

      {/* Instructions */}
      <div className="mb-6 exam-serif text-[15px] leading-relaxed">
        <ul className="list-none space-y-1">
          <li className="flex gap-2">
            <span className="mt-0.5">●</span>
            <span>
              <strong>
                Read the article below and summarize it in your own words as far
                as possible in English.
              </strong>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5">●</span>
            <span>
              <strong>Summarize it between 90 and 110 words.</strong>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5">●</span>
            <span>
              <strong>
                Write your summary in the space provided on Side A of your answer
                sheet.{" "}
                <span className="underline">
                  Any writing outside the space will not be graded.
                </span>
              </strong>
            </span>
          </li>
        </ul>
      </div>

      {/* Passage + Answer: side-by-side on wide screens */}
      <div className="flex flex-col xl:flex-row xl:gap-8">
        {/* Passage */}
        <div className="exam-passage xl:w-1/2 xl:flex-shrink-0 mb-8 xl:mb-0">
          {question.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Answer area */}
        <div className="xl:w-1/2 xl:flex-shrink-0 border-t xl:border-t-0 xl:border-l border-gray-300 pt-6 xl:pt-0 xl:pl-8">
          <textarea
            className="lined-textarea w-full border border-gray-300 rounded-sm focus:outline-none focus:border-blue-400"
            rows={16}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your summary here..."
            disabled={submitting}
          />
          <WordCounter count={wordCount} />

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={submitting || wordCount === 0}
              className="px-6 py-2.5 text-white text-sm rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--eiken-navy)" }}
            >
              {submitting ? "採点中..." : "採点する"}
            </button>
            {submitting && (
              <span className="text-sm text-gray-500">AI採点を実行しています...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
