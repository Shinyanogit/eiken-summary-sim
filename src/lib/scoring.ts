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
function getZeroProbability(wordCount: number): number {
  if (wordCount < 90 || wordCount > 110) return 1.0;
  const distance = Math.abs(wordCount - 100);
  if (distance >= 10) return 0.9; // 90 or 110
  if (distance >= 9) return 0.7;  // 91 or 109
  if (distance >= 8) return 0.5;  // 92 or 108
  if (distance >= 7) return 0.4;  // 93 or 107
  if (distance >= 6) return 0.3;  // 94 or 106
  if (distance >= 5) return 0.2;  // 95 or 105
  if (distance >= 1) return 0.1;  // 96-99, 101-104
  return 0.05;                    // exactly 100
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

// Fancy words list - every occurrence counts (duplicates included)
const FANCY_WORDS = [
  "marvelous", "lucid", "unprecedented", "notwithstanding", "paradigm",
  "exacerbate", "juxtaposition", "inherently", "multifaceted", "albeit",
  "furthermore", "consequently", "nevertheless", "henceforth", "ubiquitous",
  "quintessential", "ephemeral", "pragmatic", "idiosyncratic", "conundrum",
  "dichotomy", "enigmatic", "fastidious", "gregarious", "hegemony",
  "iconoclast", "labyrinthine", "magnanimous", "nefarious", "obfuscate",
  "panacea", "recalcitrant", "sanguine", "tantamount", "unequivocal",
  "vicissitude", "zealous", "ameliorate", "bellicose", "cacophony",
  "deleterious", "ebullient", "fortuitous", "garrulous", "harbinger",
  "impervious", "juxtapose", "kaleidoscope", "loquacious", "mellifluous",
  "nomenclature", "ostentatious", "perfunctory", "quixotic", "repudiate",
  "sagacious", "truculent", "unctuous", "venerable", "watershed",
];

export function countFancyWords(text: string): { score: number; found: { word: string; count: number }[] } {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const found: { word: string; count: number }[] = [];
  let totalHits = 0;

  for (const fancy of FANCY_WORDS) {
    const count = words.filter((w) => w.replace(/[^a-z]/g, "") === fancy).length;
    if (count > 0) {
      found.push({ word: fancy, count });
      totalHits += count;
    }
  }

  // 0 hits = 0, 1-2 = 2, 3-4 = 4, 5-7 = 6, 8+ = 8
  let score = 0;
  if (totalHits >= 8) score = 8;
  else if (totalHits >= 5) score = 6;
  else if (totalHits >= 3) score = 4;
  else if (totalHits >= 1) score = 2;

  return { score, found };
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
