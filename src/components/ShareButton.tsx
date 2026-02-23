"use client";

import type { RefObject } from "react";
import type { CertificateHandle } from "./Certificate";

interface ShareButtonProps {
  score: number;
  passed: boolean;
  certRef?: RefObject<CertificateHandle | null>;
  content: number;
  organization: number;
  vocabulary: number;
  grammar: number;
}

export default function ShareButton({ score, passed, certRef, content, organization, vocabulary, grammar }: ShareButtonProps) {
  const verdict = passed ? "合格" : "不合格";
  const text = `英険1級 要約シュミレーターで ${score}/32 点（${verdict}）でした！\n\n#英険要約シュミレーター #英検`;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/share?c=${content}&o=${organization}&v=${vocabulary}&g=${grammar}`;
  const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  function canShareFiles(): boolean {
    try {
      if (typeof navigator.share !== "function") return false;
      if (typeof navigator.canShare !== "function") return false;
      const testFile = new File([""], "t.png", { type: "image/png" });
      return navigator.canShare({ files: [testFile] });
    } catch {
      return false;
    }
  }

  function openTweet(targetWindow?: Window | null) {
    if (targetWindow && !targetWindow.closed) {
      targetWindow.location.href = tweetUrl;
      targetWindow.focus();
      return;
    }

    const opened = window.open(tweetUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = tweetUrl;
    }
  }

  async function shareWithImage(fallbackWindow: Window | null) {
    try {
      const blob = await certRef?.current?.toBlob();
      if (!blob) {
        openTweet(fallbackWindow);
        return;
      }

      const file = new File([blob], "英険1級_合格証明書.png", { type: "image/png" });
      const shareData = { text: `${text}\n${url}`, files: [file] };
      await navigator.share(shareData);
      fallbackWindow?.close();
    } catch (e) {
      if ((e as DOMException).name === "AbortError") {
        fallbackWindow?.close();
        return;
      }
      openTweet(fallbackWindow);
    }
  }

  function handleShare() {
    if (passed && certRef?.current && canShareFiles()) {
      const fallbackWindow = window.open("about:blank", "_blank");
      if (fallbackWindow) {
        fallbackWindow.opener = null;
      }
      void shareWithImage(fallbackWindow);
      return;
    }

    openTweet();
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      結果をXでシェア
    </button>
  );
}
