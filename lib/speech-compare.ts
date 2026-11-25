export interface WordResult {
  word: string;
  ok: boolean;
}

export interface CompareResult {
  words: WordResult[];
  score: number;
  bestSpoken: string;
}

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const EXPANSIONS: Record<string, string[]> = {
  // Contractions (with apostrophe)
  "i'm": ["i", "am"],
  "i'd": ["i", "would"],
  "i'll": ["i", "will"],
  "i've": ["i", "have"],
  "you're": ["you", "are"],
  "you'd": ["you", "would"],
  "you'll": ["you", "will"],
  "you've": ["you", "have"],
  "he's": ["he", "is"],
  "he'd": ["he", "would"],
  "he'll": ["he", "will"],
  "she's": ["she", "is"],
  "she'd": ["she", "would"],
  "she'll": ["she", "will"],
  "it's": ["it", "is"],
  "it'll": ["it", "will"],
  "we're": ["we", "are"],
  "we'd": ["we", "would"],
  "we'll": ["we", "will"],
  "we've": ["we", "have"],
  "they're": ["they", "are"],
  "they'd": ["they", "would"],
  "they'll": ["they", "will"],
  "they've": ["they", "have"],
  "that's": ["that", "is"],
  "there's": ["there", "is"],
  "here's": ["here", "is"],
  "what's": ["what", "is"],
  "who's": ["who", "is"],
  "where's": ["where", "is"],
  "how's": ["how", "is"],
  "let's": ["let", "us"],
  "don't": ["do", "not"],
  "doesn't": ["does", "not"],
  "didn't": ["did", "not"],
  "can't": ["can", "not"],
  "couldn't": ["could", "not"],
  "won't": ["will", "not"],
  "wouldn't": ["would", "not"],
  "shouldn't": ["should", "not"],
  "isn't": ["is", "not"],
  "aren't": ["are", "not"],
  "wasn't": ["was", "not"],
  "weren't": ["were", "not"],
  "haven't": ["have", "not"],
  "hasn't": ["has", "not"],
  "hadn't": ["had", "not"],
  // Safe apostrophe-less STT outputs (exclude real standalone words like id, ill, well, wed, were, its, lets)
  im: ["i", "am"],
  youre: ["you", "are"],
  youve: ["you", "have"],
  theyre: ["they", "are"],
  theyve: ["they", "have"],
  thats: ["that", "is"],
  theres: ["there", "is"],
  whats: ["what", "is"],
  dont: ["do", "not"],
  doesnt: ["does", "not"],
  didnt: ["did", "not"],
  cant: ["can", "not"],
  cannot: ["can", "not"],
  couldnt: ["could", "not"],
  wouldnt: ["would", "not"],
  shouldnt: ["should", "not"],
  isnt: ["is", "not"],
  arent: ["are", "not"],
  wasnt: ["was", "not"],
  werent: ["were", "not"],
  havent: ["have", "not"],
  hasnt: ["has", "not"],
  hadnt: ["had", "not"],
  // Informal speech / spelling variants
  gonna: ["going", "to"],
  wanna: ["want", "to"],
  gotta: ["got", "to"],
  ok: ["okay"],
  colour: ["color"],
  favourite: ["favorite"],
  centre: ["center"],
  theatre: ["theater"],
  practise: ["practice"],
  travelled: ["traveled"],
  // Numbers commonly returned as digits by STT
  "0": ["zero"],
  "1": ["one"],
  "2": ["two"],
  "3": ["three"],
  "4": ["four"],
  "5": ["five"],
  "6": ["six"],
  "7": ["seven"],
  "8": ["eight"],
  "9": ["nine"],
  "10": ["ten"],
  "11": ["eleven"],
  "12": ["twelve"],
  "13": ["thirteen"],
  "14": ["fourteen"],
  "15": ["fifteen"],
  "16": ["sixteen"],
  "17": ["seventeen"],
  "18": ["eighteen"],
  "19": ["nineteen"],
  "20": ["twenty"],
  "30": ["thirty"],
  "40": ["forty"],
  "50": ["fifty"],
  "60": ["sixty"],
  "70": ["seventy"],
  "80": ["eighty"],
  "90": ["ninety"],
  "100": ["one", "hundred"],
  "1st": ["first"],
  "2nd": ["second"],
  "3rd": ["third"],
  "4th": ["fourth"],
  "5th": ["fifth"],
};

export function expandToken(rawToken: string): string[] {
  const clean = normalize(rawToken);
  if (!clean) return [];
  const parts: string[] = [];
  for (const word of clean.split(" ")) {
    if (!word) continue;
    const mapped = EXPANSIONS[word];
    if (mapped) {
      parts.push(...mapped);
    } else if (word.endsWith("'s") && word.length > 2) {
      // Possessive or singular contraction like "name's" -> ["name", "is"] / ["name"]
      parts.push(word.slice(0, -2), "is");
    } else {
      parts.push(word.replace(/'/g, ""));
    }
  }
  return parts;
}

function scoreSingle(display: string[], tGroups: string[][], spoken: string): { words: WordResult[]; score: number } {
  const tTokens: string[] = [];
  const owner: number[] = [];
  tGroups.forEach((group, idx) => {
    for (const tok of group) {
      tTokens.push(tok);
      owner.push(idx);
    }
  });

  const sTokens = expandToken(spoken);
  const n = tTokens.length;
  const m = sTokens.length;

  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = tTokens[i] === sTokens[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const tokenOk = new Array(n).fill(false);
  let i = 0;
  let j = 0;
  let matchedCount = 0;
  while (i < n && j < m) {
    if (tTokens[i] === sTokens[j]) {
      tokenOk[i] = true;
      matchedCount++;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }

  const wordOk = tGroups.map((group) => group.length === 0);
  const groupCounts = tGroups.map(() => 0);
  for (let idx = 0; idx < n; idx++) {
    if (tokenOk[idx]) groupCounts[owner[idx]]++;
  }
  for (let k = 0; k < tGroups.length; k++) {
    if (tGroups[k].length > 0 && groupCounts[k] === tGroups[k].length) {
      wordOk[k] = true;
    }
  }

  const words = display.map((w, k) => ({ word: w, ok: wordOk[k] }));
  const valid = tGroups.filter((g) => g.length > 0).length || 1;
  const hits = wordOk.filter((ok, k) => ok && tGroups[k].length > 0).length;
  const extra = Math.max(0, m - matchedCount);
  const score = m === 0 ? 0 : Math.max(0, Math.round((hits / valid) * 100 - extra * 3));
  return { words, score: Math.min(100, score) };
}

/** Gióng hàng theo LCS (hỗ trợ từ viết tắt & số): từ có trong câu nói → xanh, thiếu/sai → đỏ */
export function compareSentence(target: string, spoken: string, alternatives?: string[]): CompareResult {
  const display = target.trim().split(/\s+/).filter(Boolean);
  const tGroups = display.map((w) => expandToken(w));
  const validCount = tGroups.filter((g) => g.length > 0).length;

  let best = scoreSingle(display, tGroups, spoken);
  let bestSpoken = spoken;

  // Chỉ đối chiếu thêm các phương án dự phòng với câu dài (>= 3 từ) để tránh làm sai lệch cặp âm tối thiểu 1 từ
  if (alternatives?.length && validCount >= 3) {
    for (const alt of alternatives) {
      if (!alt.trim()) continue;
      const candidate = scoreSingle(display, tGroups, alt);
      if (candidate.score > best.score) {
        best = candidate;
        bestSpoken = alt;
      }
    }
  }

  return { ...best, bestSpoken };
}
