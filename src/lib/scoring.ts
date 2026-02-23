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
// Quadratic: prob = (distance/10)^2  →  100語=0%, 95語=25%, 90語=100%
function getZeroProbability(wordCount: number): number {
  if (wordCount < 90 || wordCount > 110) return 1.0;
  const distance = Math.abs(wordCount - 100);
  return (distance / 10) ** 2;
}

export function checkWordCountGate(wordCount: number): { passed: boolean; reason?: string } {
  if (wordCount === 0) {
    return { passed: false, reason: "解答が入力されていません。" };
  }
  if (wordCount < 90 || wordCount > 110) {
    return { passed: false, reason: undefined };
  }
  const prob = getZeroProbability(wordCount);
  const roll = Math.random();
  if (roll < prob) {
    return { passed: false, reason: undefined };
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
