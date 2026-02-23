export interface ScoreResult {
  content: number;
  organization: number;
  vocabulary: number;
  grammar: number;
  feedback: string;
  wordCount: number;
  zeroReason?: string;
  serious?: boolean;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

// Returns probability of getting 0/0/0/0 based on word count
// 5th-power pass rate: min((w-90)^5/1000, (110-w)^5/1000) %, capped at 100
// 100 = safe, 99/101 = 41% zero, 95/105 = 97% zero, 90/110 = 100% zero
function getZeroProbability(wordCount: number): number {
  if (wordCount < 90 || wordCount > 110) return 1.0;
  const passPercent = Math.min((wordCount - 90) ** 5 / 1000, (110 - wordCount) ** 5 / 1000);
  const passRate = Math.min(passPercent, 100) / 100;
  return 1 - passRate;
}

export function checkWordCountGate(wordCount: number): { passed: boolean; reason?: string } {
  if (wordCount === 0) {
    return { passed: false, reason: "解答が入力されていません。" };
  }
  if (wordCount < 90 || wordCount > 110) {
    return { passed: false };
  }
  const prob = getZeroProbability(wordCount);
  const roll = Math.random();
  if (roll < prob) {
    return {
      passed: false,
      reason: `語数は規定範囲内（${wordCount}語）ですが、総合的な判定により語数規定違反と判定されました。\n※ この判定は確率的なものであり、同じ解答でも結果が異なる場合があります。\n※ 異議申し立ては受け付けておりません。`,
    };
  }
  return { passed: true };
}

export function makeZeroScore(wordCount: number, reason?: string): ScoreResult {
  const feedback = reason
    || `語数が規定の範囲（90語〜110語）を満たしていないため、全項目0点と判定されました。\n検出語数: ${wordCount}語\n※語数規定違反の場合、解答内容に関わらず採点対象外となります。`;
  return {
    content: 0,
    organization: 0,
    vocabulary: 0,
    grammar: 0,
    feedback,
    wordCount,
  };
}
