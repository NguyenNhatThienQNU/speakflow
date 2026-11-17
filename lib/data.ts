// =============================================================
// Dữ liệu mẫu (mock data) cho SpeakFlow — Mất gốc → C1
// Có thể thay thế bằng Firestore / PostgreSQL sau này.
// =============================================================

export type LevelId = "pre" | "a1" | "a2" | "b1" | "b2" | "c1";

export interface Level {
  id: LevelId;
  code: string;
  nameVi: string;
  nameEn: string;
  descVi: string;
  stage: string;
  /** Ngôn ngữ giao diện mặc định ở cấp này */
  ui: "vi" | "en";
  color: string; // tailwind gradient
}

export const LEVELS: Level[] = [
  { id: "pre", code: "Pre-A1", nameVi: "Mất gốc", nameEn: "Foundation", stage: "Giai đoạn 0", ui: "vi",
    descVi: "Bảng IPA 44 âm, quy tắc ghép vần, từ vựng cốt lõi và mẫu câu sinh tồn.", color: "from-sky-400 to-cyan-400" },
  { id: "a1", code: "A1", nameVi: "Sơ cấp 1", nameEn: "Beginner", stage: "Giai đoạn 1", ui: "vi",
    descVi: "Chào hỏi, giới thiệu bản thân, gia đình, số đếm, giờ giấc.", color: "from-cyan-400 to-teal-400" },
  { id: "a2", code: "A2", nameVi: "Sơ cấp 2", nameEn: "Elementary", stage: "Giai đoạn 1", ui: "vi",
    descVi: "Mua sắm, hỏi đường, gọi món, công việc cơ bản; nghe chậm và nhại âm.", color: "from-teal-400 to-emerald-400" },
  { id: "b1", code: "B1", nameVi: "Trung cấp 1", nameEn: "Intermediate", stage: "Giai đoạn 2", ui: "en",
    descVi: "Hội thoại phân nhánh: du lịch, xử lý sự cố, họp nhóm.", color: "from-emerald-400 to-green-500" },
  { id: "b2", code: "B2", nameVi: "Trung cấp 2", nameEn: "Upper-Intermediate", stage: "Giai đoạn 2", ui: "en",
    descVi: "Phỏng vấn xin việc, thương lượng, phản xạ không dịch.", color: "from-blue-500 to-sky-500" },
  { id: "c1", code: "C1", nameVi: "Cao cấp", nameEn: "Advanced", stage: "Giai đoạn 3", ui: "en",
    descVi: "Idioms, phrasal verbs nâng cao, sắc thái trang trọng/thân mật, tranh biện.", color: "from-indigo-500 to-blue-500" },
];

export const levelById = (id: LevelId) => LEVELS.find((l) => l.id === id)!;

// -------------------------------------------------------------
// IPA — 44 âm (12 nguyên âm đơn, 8 nguyên âm đôi, 24 phụ âm)
// mouth: mô tả khẩu hình; tip: so sánh với tiếng Việt
// -------------------------------------------------------------
export type IpaType = "short" | "long" | "diphthong" | "voiceless" | "voiced";
export interface IpaSound {
  symbol: string;
  type: IpaType;
  word: string;
  wordIpa: string;
  mouth: { lips: "spread" | "round" | "neutral" | "open"; jaw: number; tongue: string };
  tipVi: string;
}

export const IPA: IpaSound[] = [
  // Nguyên âm ngắn
  { symbol: "ɪ", type: "short", word: "sit", wordIpa: "/sɪt/", mouth: { lips: "spread", jaw: 1, tongue: "Lưỡi cao, phía trước" }, tipVi: "Giống 'i' tiếng Việt nhưng ngắn, dứt khoát, miệng hơi thả lỏng." },
  { symbol: "e", type: "short", word: "bed", wordIpa: "/bed/", mouth: { lips: "spread", jaw: 2, tongue: "Lưỡi giữa, phía trước" }, tipVi: "Giống 'e' tiếng Việt, đọc ngắn." },
  { symbol: "æ", type: "short", word: "cat", wordIpa: "/kæt/", mouth: { lips: "open", jaw: 3, tongue: "Lưỡi thấp, phía trước" }, tipVi: "Lai giữa 'a' và 'e': mở miệng rộng như nói 'a' nhưng khẩu hình 'e'." },
  { symbol: "ʌ", type: "short", word: "cup", wordIpa: "/kʌp/", mouth: { lips: "neutral", jaw: 2, tongue: "Lưỡi giữa" }, tipVi: "Gần giống 'ă' tiếng Việt." },
  { symbol: "ɒ", type: "short", word: "hot", wordIpa: "/hɒt/", mouth: { lips: "round", jaw: 3, tongue: "Lưỡi thấp, phía sau" }, tipVi: "Gần 'o' tiếng Việt, ngắn, môi hơi tròn." },
  { symbol: "ʊ", type: "short", word: "book", wordIpa: "/bʊk/", mouth: { lips: "round", jaw: 1, tongue: "Lưỡi cao, phía sau" }, tipVi: "Giống 'u' nhưng ngắn, môi không chu nhiều." },
  { symbol: "ə", type: "short", word: "about", wordIpa: "/əˈbaʊt/", mouth: { lips: "neutral", jaw: 1, tongue: "Lưỡi thả lỏng ở giữa" }, tipVi: "Âm 'ơ' rất nhẹ — âm phổ biến nhất trong tiếng Anh, xuất hiện ở âm tiết không nhấn." },
  // Nguyên âm dài
  { symbol: "iː", type: "long", word: "see", wordIpa: "/siː/", mouth: { lips: "spread", jaw: 1, tongue: "Lưỡi cao, phía trước" }, tipVi: "'i' kéo dài, môi bành sang hai bên như đang cười." },
  { symbol: "ɑː", type: "long", word: "car", wordIpa: "/kɑː(r)/", mouth: { lips: "open", jaw: 3, tongue: "Lưỡi thấp, phía sau" }, tipVi: "'a' kéo dài, mở miệng rộng." },
  { symbol: "ɔː", type: "long", word: "door", wordIpa: "/dɔː(r)/", mouth: { lips: "round", jaw: 2, tongue: "Lưỡi giữa, phía sau" }, tipVi: "'o' kéo dài, môi tròn." },
  { symbol: "uː", type: "long", word: "blue", wordIpa: "/bluː/", mouth: { lips: "round", jaw: 1, tongue: "Lưỡi cao, phía sau" }, tipVi: "'u' kéo dài, môi chu ra trước." },
  { symbol: "ɜː", type: "long", word: "bird", wordIpa: "/bɜːd/", mouth: { lips: "neutral", jaw: 2, tongue: "Lưỡi giữa" }, tipVi: "'ơ' kéo dài; giọng Mỹ thêm cong lưỡi /r/." },
  // Nguyên âm đôi
  { symbol: "eɪ", type: "diphthong", word: "day", wordIpa: "/deɪ/", mouth: { lips: "spread", jaw: 2, tongue: "Trượt từ /e/ lên /ɪ/" }, tipVi: "Giống 'ây' tiếng Việt." },
  { symbol: "aɪ", type: "diphthong", word: "my", wordIpa: "/maɪ/", mouth: { lips: "open", jaw: 3, tongue: "Trượt từ /a/ lên /ɪ/" }, tipVi: "Giống 'ai' tiếng Việt." },
  { symbol: "ɔɪ", type: "diphthong", word: "boy", wordIpa: "/bɔɪ/", mouth: { lips: "round", jaw: 2, tongue: "Trượt từ /ɔ/ lên /ɪ/" }, tipVi: "Giống 'oi' tiếng Việt." },
  { symbol: "aʊ", type: "diphthong", word: "now", wordIpa: "/naʊ/", mouth: { lips: "open", jaw: 3, tongue: "Trượt từ /a/ sang /ʊ/" }, tipVi: "Giống 'ao' tiếng Việt." },
  { symbol: "əʊ", type: "diphthong", word: "go", wordIpa: "/ɡəʊ/", mouth: { lips: "round", jaw: 2, tongue: "Trượt từ /ə/ sang /ʊ/" }, tipVi: "Giống 'âu' tiếng Việt (giọng Anh); giọng Mỹ là /oʊ/ 'ôu'." },
  { symbol: "ɪə", type: "diphthong", word: "near", wordIpa: "/nɪə(r)/", mouth: { lips: "spread", jaw: 1, tongue: "Trượt từ /ɪ/ sang /ə/" }, tipVi: "Giống 'ia' tiếng Việt." },
  { symbol: "eə", type: "diphthong", word: "hair", wordIpa: "/heə(r)/", mouth: { lips: "spread", jaw: 2, tongue: "Trượt từ /e/ sang /ə/" }, tipVi: "Giống 'e-ơ' nối liền." },
  { symbol: "ʊə", type: "diphthong", word: "tour", wordIpa: "/tʊə(r)/", mouth: { lips: "round", jaw: 1, tongue: "Trượt từ /ʊ/ sang /ə/" }, tipVi: "Giống 'ua' tiếng Việt." },
  // Phụ âm vô thanh
  { symbol: "p", type: "voiceless", word: "pen", wordIpa: "/pen/", mouth: { lips: "neutral", jaw: 1, tongue: "Hai môi mím rồi bật hơi" }, tipVi: "Bật hơi mạnh — đặt tờ giấy trước miệng sẽ thấy giấy rung. Khác 'p' tiếng Việt." },
  { symbol: "t", type: "voiceless", word: "tea", wordIpa: "/tiː/", mouth: { lips: "spread", jaw: 1, tongue: "Đầu lưỡi chạm lợi trên" }, tipVi: "Giống 'th' tiếng Việt khi đứng đầu từ (bật hơi). Cuối từ phải bật nhẹ, không nuốt." },
  { symbol: "k", type: "voiceless", word: "key", wordIpa: "/kiː/", mouth: { lips: "neutral", jaw: 1, tongue: "Cuống lưỡi chạm ngạc mềm" }, tipVi: "Giống 'kh' nhẹ — có bật hơi." },
  { symbol: "f", type: "voiceless", word: "fish", wordIpa: "/fɪʃ/", mouth: { lips: "neutral", jaw: 1, tongue: "Răng trên chạm môi dưới" }, tipVi: "Giống 'ph' tiếng Việt." },
  { symbol: "θ", type: "voiceless", word: "think", wordIpa: "/θɪŋk/", mouth: { lips: "neutral", jaw: 1, tongue: "Đầu lưỡi đặt giữa hai hàm răng" }, tipVi: "Không có trong tiếng Việt! Thè đầu lưỡi giữa răng, thổi hơi — đừng đọc thành 'th' hay 't'." },
  { symbol: "s", type: "voiceless", word: "sun", wordIpa: "/sʌn/", mouth: { lips: "spread", jaw: 1, tongue: "Lưỡi gần lợi trên" }, tipVi: "Giống 'x' tiếng Việt. Nhớ phát âm /s/ ở cuối từ (cats, books)." },
  { symbol: "ʃ", type: "voiceless", word: "she", wordIpa: "/ʃiː/", mouth: { lips: "round", jaw: 1, tongue: "Lưỡi lùi sau, môi chu" }, tipVi: "Giống 's' nặng (miền Bắc đọc 's' cong lưỡi), môi chu ra." },
  { symbol: "tʃ", type: "voiceless", word: "chair", wordIpa: "/tʃeə(r)/", mouth: { lips: "round", jaw: 1, tongue: "Từ /t/ bật sang /ʃ/" }, tipVi: "Giống 'ch' nhưng môi chu và bật hơi." },
  { symbol: "h", type: "voiceless", word: "hat", wordIpa: "/hæt/", mouth: { lips: "open", jaw: 2, tongue: "Thả lỏng, đẩy hơi từ cổ" }, tipVi: "Giống 'h' tiếng Việt." },
  // Phụ âm hữu thanh
  { symbol: "b", type: "voiced", word: "bag", wordIpa: "/bæɡ/", mouth: { lips: "neutral", jaw: 1, tongue: "Hai môi mím rồi mở" }, tipVi: "Giống 'b' tiếng Việt, dây thanh rung." },
  { symbol: "d", type: "voiced", word: "dog", wordIpa: "/dɒɡ/", mouth: { lips: "spread", jaw: 1, tongue: "Đầu lưỡi chạm lợi trên" }, tipVi: "Giống 'đ' tiếng Việt." },
  { symbol: "ɡ", type: "voiced", word: "go", wordIpa: "/ɡəʊ/", mouth: { lips: "neutral", jaw: 1, tongue: "Cuống lưỡi chạm ngạc mềm" }, tipVi: "Giống 'g' tiếng Việt." },
  { symbol: "v", type: "voiced", word: "van", wordIpa: "/væn/", mouth: { lips: "neutral", jaw: 1, tongue: "Răng trên chạm môi dưới" }, tipVi: "Giống 'v' tiếng Việt; răng phải chạm môi dưới." },
  { symbol: "ð", type: "voiced", word: "this", wordIpa: "/ðɪs/", mouth: { lips: "neutral", jaw: 1, tongue: "Đầu lưỡi giữa hai hàm răng" }, tipVi: "Như /θ/ nhưng rung dây thanh. Đừng đọc thành 'đ' hay 'd'." },
  { symbol: "z", type: "voiced", word: "zoo", wordIpa: "/zuː/", mouth: { lips: "spread", jaw: 1, tongue: "Lưỡi gần lợi trên" }, tipVi: "Như /s/ nhưng rung — gần 'd' miền Bắc. Có trong 'dogs', 'is'." },
  { symbol: "ʒ", type: "voiced", word: "vision", wordIpa: "/ˈvɪʒn/", mouth: { lips: "round", jaw: 1, tongue: "Như /ʃ/ có rung" }, tipVi: "Như /ʃ/ nhưng rung dây thanh, gần 'gi' cong lưỡi." },
  { symbol: "dʒ", type: "voiced", word: "job", wordIpa: "/dʒɒb/", mouth: { lips: "round", jaw: 1, tongue: "Từ /d/ bật sang /ʒ/" }, tipVi: "Gần 'gi' / 'tr' nặng, môi chu." },
  { symbol: "m", type: "voiced", word: "man", wordIpa: "/mæn/", mouth: { lips: "neutral", jaw: 0, tongue: "Mím môi, hơi qua mũi" }, tipVi: "Giống 'm' tiếng Việt." },
  { symbol: "n", type: "voiced", word: "no", wordIpa: "/nəʊ/", mouth: { lips: "spread", jaw: 1, tongue: "Đầu lưỡi chạm lợi, hơi qua mũi" }, tipVi: "Giống 'n' tiếng Việt." },
  { symbol: "ŋ", type: "voiced", word: "sing", wordIpa: "/sɪŋ/", mouth: { lips: "neutral", jaw: 1, tongue: "Cuống lưỡi chạm ngạc mềm" }, tipVi: "Giống 'ng' tiếng Việt; không đọc thêm 'g' ở cuối." },
  { symbol: "l", type: "voiced", word: "leg", wordIpa: "/leɡ/", mouth: { lips: "spread", jaw: 1, tongue: "Đầu lưỡi chạm lợi trên" }, tipVi: "Đầu từ giống 'l'; cuối từ (ball) phải giữ lưỡi chạm lợi, không bỏ." },
  { symbol: "r", type: "voiced", word: "red", wordIpa: "/red/", mouth: { lips: "round", jaw: 1, tongue: "Cong lưỡi về sau, không chạm vòm" }, tipVi: "Khác 'r' rung tiếng Việt: cong lưỡi, môi hơi tròn, không rung lưỡi." },
  { symbol: "w", type: "voiced", word: "we", wordIpa: "/wiː/", mouth: { lips: "round", jaw: 1, tongue: "Môi chu tròn rồi mở nhanh" }, tipVi: "Giống 'qu' / 'oa' lướt nhanh." },
  { symbol: "j", type: "voiced", word: "yes", wordIpa: "/jes/", mouth: { lips: "spread", jaw: 1, tongue: "Lưỡi cao, phía trước" }, tipVi: "Giống 'd' miền Nam / 'gi' lướt nhanh." },
];

export const IPA_GROUPS: { type: IpaType; vi: string; en: string }[] = [
  { type: "short", vi: "Nguyên âm ngắn", en: "Short vowels" },
  { type: "long", vi: "Nguyên âm dài", en: "Long vowels" },
  { type: "diphthong", vi: "Nguyên âm đôi", en: "Diphthongs" },
  { type: "voiceless", vi: "Phụ âm vô thanh", en: "Voiceless consonants" },
  { type: "voiced", vi: "Phụ âm hữu thanh", en: "Voiced consonants" },
];

// -------------------------------------------------------------
// Bài học — mỗi bài 4 bước: Từ vựng → Nghe hiểu → Nhại âm → Hội thoại
// -------------------------------------------------------------
export interface Vocab { en: string; ipa: string; vi: string; ex: string; exVi: string }
export interface Line { who: string; en: string; vi: string }
export interface Lesson {
  id: string;
  level: LevelId;
  title: string;
  titleVi: string;
  icon: string; // emoji
  minutes: number;
  vocab: Vocab[];
  listening: { lines: Line[]; q: string; qVi: string; options: string[]; answer: number };
  shadowing: { en: string; vi: string }[];
  scenarioId: string;
}

export const LESSONS: Lesson[] = [
  // ============ PRE-A1 ============
  {
    id: "pre-1", level: "pre", icon: "👋", minutes: 10, title: "Hello & Goodbye", titleVi: "Chào hỏi sinh tồn",
    vocab: [
      { en: "hello", ipa: "/həˈləʊ/", vi: "xin chào", ex: "Hello, I'm Lan.", exVi: "Xin chào, mình là Lan." },
      { en: "thank you", ipa: "/ˈθæŋk juː/", vi: "cảm ơn", ex: "Thank you very much.", exVi: "Cảm ơn rất nhiều." },
      { en: "sorry", ipa: "/ˈsɒri/", vi: "xin lỗi", ex: "Sorry, I'm late.", exVi: "Xin lỗi, tôi đến muộn." },
      { en: "please", ipa: "/pliːz/", vi: "làm ơn", ex: "Water, please.", exVi: "Cho tôi nước, làm ơn." },
      { en: "goodbye", ipa: "/ɡʊdˈbaɪ/", vi: "tạm biệt", ex: "Goodbye, see you!", exVi: "Tạm biệt, hẹn gặp lại!" },
    ],
    listening: {
      lines: [
        { who: "A", en: "Hello! I'm Tom.", vi: "Xin chào! Tôi là Tom." },
        { who: "B", en: "Hi Tom. I'm Mai. Nice to meet you.", vi: "Chào Tom. Mình là Mai. Rất vui được gặp bạn." },
        { who: "A", en: "Nice to meet you too.", vi: "Mình cũng rất vui được gặp bạn." },
      ],
      q: "What is the girl's name?", qVi: "Cô gái tên là gì?", options: ["Tom", "Mai", "Lan"], answer: 1,
    },
    shadowing: [
      { en: "Hello, nice to meet you.", vi: "Xin chào, rất vui được gặp bạn." },
      { en: "Thank you very much.", vi: "Cảm ơn rất nhiều." },
      { en: "Sorry, can you say that again?", vi: "Xin lỗi, bạn nói lại được không?" },
    ],
    scenarioId: "meet",
  },
  {
    id: "pre-2", level: "pre", icon: "🔢", minutes: 10, title: "Numbers & Prices", titleVi: "Số đếm & giá tiền",
    vocab: [
      { en: "one, two, three", ipa: "/wʌn tuː θriː/", vi: "một, hai, ba", ex: "I have three cats.", exVi: "Tôi có ba con mèo." },
      { en: "how much", ipa: "/haʊ mʌtʃ/", vi: "bao nhiêu (tiền)", ex: "How much is it?", exVi: "Cái này bao nhiêu tiền?" },
      { en: "dollar", ipa: "/ˈdɒlə(r)/", vi: "đô la", ex: "It's five dollars.", exVi: "Nó giá năm đô." },
      { en: "cheap", ipa: "/tʃiːp/", vi: "rẻ", ex: "This is cheap.", exVi: "Cái này rẻ." },
      { en: "expensive", ipa: "/ɪkˈspensɪv/", vi: "đắt", ex: "It's too expensive.", exVi: "Nó đắt quá." },
    ],
    listening: {
      lines: [
        { who: "A", en: "How much is this hat?", vi: "Cái mũ này bao nhiêu tiền?" },
        { who: "B", en: "It's twelve dollars.", vi: "Nó giá mười hai đô." },
        { who: "A", en: "OK, I'll take it.", vi: "Được, tôi lấy cái này." },
      ],
      q: "How much is the hat?", qVi: "Cái mũ giá bao nhiêu?", options: ["$2", "$12", "$20"], answer: 1,
    },
    shadowing: [
      { en: "How much is it?", vi: "Cái này bao nhiêu tiền?" },
      { en: "It's too expensive.", vi: "Đắt quá." },
      { en: "I'll take it.", vi: "Tôi lấy cái này." },
    ],
    scenarioId: "market",
  },
  {
    id: "pre-3", level: "pre", icon: "🆘", minutes: 12, title: "Survival Phrases", titleVi: "Mẫu câu sinh tồn",
    vocab: [
      { en: "help", ipa: "/help/", vi: "giúp đỡ", ex: "Can you help me?", exVi: "Bạn giúp tôi được không?" },
      { en: "where", ipa: "/weə(r)/", vi: "ở đâu", ex: "Where is the toilet?", exVi: "Nhà vệ sinh ở đâu?" },
      { en: "understand", ipa: "/ˌʌndəˈstænd/", vi: "hiểu", ex: "I don't understand.", exVi: "Tôi không hiểu." },
      { en: "slowly", ipa: "/ˈsləʊli/", vi: "chậm rãi", ex: "Please speak slowly.", exVi: "Làm ơn nói chậm." },
      { en: "repeat", ipa: "/rɪˈpiːt/", vi: "nhắc lại", ex: "Could you repeat that?", exVi: "Bạn nhắc lại được không?" },
    ],
    listening: {
      lines: [
        { who: "A", en: "Excuse me, where is the toilet?", vi: "Xin lỗi, nhà vệ sinh ở đâu?" },
        { who: "B", en: "It's on the left.", vi: "Ở bên trái." },
        { who: "A", en: "Sorry, I don't understand. Slowly, please.", vi: "Xin lỗi, tôi không hiểu. Làm ơn nói chậm." },
        { who: "B", en: "On... the... left.", vi: "Ở... bên... trái." },
      ],
      q: "Where is the toilet?", qVi: "Nhà vệ sinh ở đâu?", options: ["On the right", "On the left", "Upstairs"], answer: 1,
    },
    shadowing: [
      { en: "I don't understand.", vi: "Tôi không hiểu." },
      { en: "Please speak slowly.", vi: "Làm ơn nói chậm." },
      { en: "Where is the toilet?", vi: "Nhà vệ sinh ở đâu?" },
    ],
    scenarioId: "meet",
  },
  // ============ A1 ============
  {
    id: "a1-1", level: "a1", icon: "🙋", minutes: 12, title: "Introducing Yourself", titleVi: "Giới thiệu bản thân",
    vocab: [
      { en: "from", ipa: "/frɒm/", vi: "đến từ", ex: "I'm from Vietnam.", exVi: "Tôi đến từ Việt Nam." },
      { en: "live in", ipa: "/lɪv ɪn/", vi: "sống ở", ex: "I live in Quy Nhon.", exVi: "Tôi sống ở Quy Nhơn." },
      { en: "student", ipa: "/ˈstjuːdnt/", vi: "học sinh, sinh viên", ex: "I'm a high school student.", exVi: "Tôi là học sinh THPT." },
      { en: "hobby", ipa: "/ˈhɒbi/", vi: "sở thích", ex: "My hobby is reading.", exVi: "Sở thích của tôi là đọc sách." },
      { en: "years old", ipa: "/jɪəz əʊld/", vi: "tuổi", ex: "I'm sixteen years old.", exVi: "Tôi mười sáu tuổi." },
    ],
    listening: {
      lines: [
        { who: "A", en: "Hi, I'm Minh. I'm from Da Nang.", vi: "Chào, mình là Minh. Mình đến từ Đà Nẵng." },
        { who: "A", en: "I'm a teacher. I like playing football.", vi: "Mình là giáo viên. Mình thích chơi bóng đá." },
      ],
      q: "What does Minh do?", qVi: "Minh làm nghề gì?", options: ["He's a student", "He's a teacher", "He's a doctor"], answer: 1,
    },
    shadowing: [
      { en: "My name is Minh and I'm from Vietnam.", vi: "Tên tôi là Minh và tôi đến từ Việt Nam." },
      { en: "I live in Quy Nhon with my family.", vi: "Tôi sống ở Quy Nhơn với gia đình." },
      { en: "In my free time, I like reading.", vi: "Lúc rảnh, tôi thích đọc sách." },
    ],
    scenarioId: "meet",
  },
  {
    id: "a1-2", level: "a1", icon: "👨‍👩‍👧", minutes: 12, title: "My Family", titleVi: "Gia đình tôi",
    vocab: [
      { en: "parents", ipa: "/ˈpeərənts/", vi: "bố mẹ", ex: "My parents are farmers.", exVi: "Bố mẹ tôi là nông dân." },
      { en: "brother", ipa: "/ˈbrʌðə(r)/", vi: "anh/em trai", ex: "I have one brother.", exVi: "Tôi có một anh trai." },
      { en: "sister", ipa: "/ˈsɪstə(r)/", vi: "chị/em gái", ex: "My sister is a nurse.", exVi: "Chị tôi là y tá." },
      { en: "older", ipa: "/ˈəʊldə(r)/", vi: "lớn tuổi hơn", ex: "He's older than me.", exVi: "Anh ấy lớn tuổi hơn tôi." },
      { en: "get along", ipa: "/ɡet əˈlɒŋ/", vi: "hòa thuận", ex: "We get along well.", exVi: "Chúng tôi rất hòa thuận." },
    ],
    listening: {
      lines: [
        { who: "A", en: "How many people are there in your family?", vi: "Nhà bạn có mấy người?" },
        { who: "B", en: "Four. My parents, my younger sister and me.", vi: "Bốn. Bố mẹ, em gái và mình." },
      ],
      q: "How many people are in the family?", qVi: "Gia đình có mấy người?", options: ["Three", "Four", "Five"], answer: 1,
    },
    shadowing: [
      { en: "There are four people in my family.", vi: "Gia đình tôi có bốn người." },
      { en: "I have a younger sister.", vi: "Tôi có một em gái." },
      { en: "We get along very well.", vi: "Chúng tôi rất hòa thuận." },
    ],
    scenarioId: "meet",
  },
  {
    id: "a1-3", level: "a1", icon: "⏰", minutes: 12, title: "Daily Routine", titleVi: "Thói quen hằng ngày",
    vocab: [
      { en: "get up", ipa: "/ɡet ʌp/", vi: "thức dậy", ex: "I get up at six.", exVi: "Tôi dậy lúc sáu giờ." },
      { en: "have breakfast", ipa: "/hæv ˈbrekfəst/", vi: "ăn sáng", ex: "I have breakfast at home.", exVi: "Tôi ăn sáng ở nhà." },
      { en: "go to work", ipa: "/ɡəʊ tə wɜːk/", vi: "đi làm", ex: "I go to work by motorbike.", exVi: "Tôi đi làm bằng xe máy." },
      { en: "usually", ipa: "/ˈjuːʒuəli/", vi: "thường xuyên", ex: "I usually cook dinner.", exVi: "Tôi thường nấu bữa tối." },
      { en: "go to bed", ipa: "/ɡəʊ tə bed/", vi: "đi ngủ", ex: "I go to bed at eleven.", exVi: "Tôi đi ngủ lúc mười một giờ." },
    ],
    listening: {
      lines: [
        { who: "A", en: "What time do you get up?", vi: "Bạn dậy lúc mấy giờ?" },
        { who: "B", en: "I usually get up at half past five.", vi: "Mình thường dậy lúc năm rưỡi." },
      ],
      q: "What time does B get up?", qVi: "B dậy lúc mấy giờ?", options: ["5:00", "5:30", "6:30"], answer: 1,
    },
    shadowing: [
      { en: "I usually get up at six o'clock.", vi: "Tôi thường dậy lúc sáu giờ." },
      { en: "I go to work by motorbike.", vi: "Tôi đi làm bằng xe máy." },
      { en: "I go to bed at eleven.", vi: "Tôi đi ngủ lúc mười một giờ." },
    ],
    scenarioId: "meet",
  },
  // ============ A2 ============
  {
    id: "a2-1", level: "a2", icon: "☕", minutes: 15, title: "At the Coffee Shop", titleVi: "Ở quán cà phê",
    vocab: [
      { en: "I'd like...", ipa: "/aɪd laɪk/", vi: "tôi muốn (lịch sự)", ex: "I'd like an iced latte.", exVi: "Tôi muốn một ly latte đá." },
      { en: "for here or to go", ipa: "/fə hɪə ɔː tə ɡəʊ/", vi: "uống tại chỗ hay mang đi", ex: "For here or to go?", exVi: "Dùng tại đây hay mang đi?" },
      { en: "less sugar", ipa: "/les ˈʃʊɡə(r)/", vi: "ít đường", ex: "Less sugar, please.", exVi: "Làm ơn cho ít đường." },
      { en: "pay by card", ipa: "/peɪ baɪ kɑːd/", vi: "trả bằng thẻ", ex: "Can I pay by card?", exVi: "Tôi trả bằng thẻ được không?" },
      { en: "receipt", ipa: "/rɪˈsiːt/", vi: "hóa đơn", ex: "Here's your receipt.", exVi: "Hóa đơn của bạn đây." },
    ],
    listening: {
      lines: [
        { who: "Barista", en: "Hi! What can I get for you?", vi: "Chào bạn! Bạn muốn dùng gì?" },
        { who: "Customer", en: "I'd like a medium iced latte, less sugar, please.", vi: "Cho tôi một ly latte đá cỡ vừa, ít đường." },
        { who: "Barista", en: "For here or to go?", vi: "Dùng ở đây hay mang đi?" },
        { who: "Customer", en: "To go, please.", vi: "Mang đi nhé." },
      ],
      q: "What size is the drink?", qVi: "Đồ uống cỡ nào?", options: ["Small", "Medium", "Large"], answer: 1,
    },
    shadowing: [
      { en: "I'd like a medium iced latte, please.", vi: "Cho tôi một ly latte đá cỡ vừa." },
      { en: "Less sugar, please.", vi: "Làm ơn cho ít đường." },
      { en: "Can I pay by card?", vi: "Tôi trả bằng thẻ được không?" },
    ],
    scenarioId: "cafe",
  },
  {
    id: "a2-2", level: "a2", icon: "🗺️", minutes: 15, title: "Asking for Directions", titleVi: "Hỏi đường",
    vocab: [
      { en: "turn left", ipa: "/tɜːn left/", vi: "rẽ trái", ex: "Turn left at the corner.", exVi: "Rẽ trái ở góc đường." },
      { en: "go straight", ipa: "/ɡəʊ streɪt/", vi: "đi thẳng", ex: "Go straight for 200 metres.", exVi: "Đi thẳng 200 mét." },
      { en: "next to", ipa: "/nekst tə/", vi: "bên cạnh", ex: "It's next to the bank.", exVi: "Nó ở cạnh ngân hàng." },
      { en: "opposite", ipa: "/ˈɒpəzɪt/", vi: "đối diện", ex: "It's opposite the park.", exVi: "Nó đối diện công viên." },
      { en: "traffic lights", ipa: "/ˈtræfɪk laɪts/", vi: "đèn giao thông", ex: "Turn right at the traffic lights.", exVi: "Rẽ phải ở đèn giao thông." },
    ],
    listening: {
      lines: [
        { who: "A", en: "Excuse me, how do I get to the train station?", vi: "Xin lỗi, đến ga tàu đi thế nào?" },
        { who: "B", en: "Go straight, then turn right at the traffic lights. It's opposite the post office.", vi: "Đi thẳng, rẽ phải ở đèn giao thông. Nó đối diện bưu điện." },
      ],
      q: "Where is the station?", qVi: "Ga tàu ở đâu?", options: ["Next to the bank", "Opposite the post office", "Behind the park"], answer: 1,
    },
    shadowing: [
      { en: "Excuse me, how do I get to the station?", vi: "Xin lỗi, đến ga đi thế nào?" },
      { en: "Turn right at the traffic lights.", vi: "Rẽ phải ở đèn giao thông." },
      { en: "Is it far from here?", vi: "Có xa đây không?" },
    ],
    scenarioId: "directions",
  },
  {
    id: "a2-3", level: "a2", icon: "🛍️", minutes: 15, title: "Shopping for Clothes", titleVi: "Mua quần áo",
    vocab: [
      { en: "try on", ipa: "/traɪ ɒn/", vi: "mặc thử", ex: "Can I try this on?", exVi: "Tôi mặc thử được không?" },
      { en: "fitting room", ipa: "/ˈfɪtɪŋ ruːm/", vi: "phòng thử đồ", ex: "Where's the fitting room?", exVi: "Phòng thử đồ ở đâu?" },
      { en: "size", ipa: "/saɪz/", vi: "cỡ", ex: "Do you have a smaller size?", exVi: "Có cỡ nhỏ hơn không?" },
      { en: "discount", ipa: "/ˈdɪskaʊnt/", vi: "giảm giá", ex: "Is there a discount?", exVi: "Có giảm giá không?" },
      { en: "fit", ipa: "/fɪt/", vi: "vừa (kích cỡ)", ex: "It doesn't fit me.", exVi: "Nó không vừa với tôi." },
    ],
    listening: {
      lines: [
        { who: "Customer", en: "Excuse me, do you have this shirt in a medium?", vi: "Xin lỗi, áo này có cỡ M không?" },
        { who: "Staff", en: "Yes, here you are. The fitting room is over there.", vi: "Có, của bạn đây. Phòng thử ở đằng kia." },
        { who: "Customer", en: "Thanks. Is there any discount today?", vi: "Cảm ơn. Hôm nay có giảm giá không?" },
        { who: "Staff", en: "Yes, twenty percent off.", vi: "Có, giảm hai mươi phần trăm." },
      ],
      q: "How much is the discount?", qVi: "Giảm giá bao nhiêu?", options: ["10%", "20%", "30%"], answer: 1,
    },
    shadowing: [
      { en: "Can I try this on?", vi: "Tôi mặc thử được không?" },
      { en: "Do you have a smaller size?", vi: "Có cỡ nhỏ hơn không?" },
      { en: "It fits perfectly. I'll take it.", vi: "Vừa khít. Tôi lấy cái này." },
    ],
    scenarioId: "market",
  },
  // ============ B1 ============
  {
    id: "b1-1", level: "b1", icon: "🏨", minutes: 15, title: "Hotel Check-in Problems", titleVi: "Sự cố khi nhận phòng",
    vocab: [
      { en: "booking / reservation", ipa: "/ˈbʊkɪŋ/", vi: "đặt chỗ", ex: "I have a booking under Nguyen.", exVi: "Tôi có đặt phòng tên Nguyễn." },
      { en: "mix-up", ipa: "/ˈmɪks ʌp/", vi: "sự nhầm lẫn", ex: "There seems to be a mix-up.", exVi: "Hình như có nhầm lẫn." },
      { en: "upgrade", ipa: "/ˈʌpɡreɪd/", vi: "nâng hạng", ex: "Could you upgrade my room?", exVi: "Có thể nâng hạng phòng giúp tôi không?" },
      { en: "out of order", ipa: "/aʊt əv ˈɔːdə/", vi: "bị hỏng", ex: "The air conditioner is out of order.", exVi: "Điều hòa bị hỏng." },
      { en: "sort it out", ipa: "/sɔːt ɪt aʊt/", vi: "giải quyết", ex: "Can you sort it out today?", exVi: "Hôm nay giải quyết được không?" },
    ],
    listening: {
      lines: [
        { who: "Guest", en: "Hi, I booked a double room, but this is a single.", vi: "Chào, tôi đặt phòng đôi nhưng đây là phòng đơn." },
        { who: "Receptionist", en: "I'm so sorry about the mix-up. We're fully booked tonight, but I can upgrade you to a suite at no extra cost.", vi: "Rất xin lỗi vì nhầm lẫn. Tối nay hết phòng, nhưng tôi có thể nâng lên phòng suite miễn phí." },
      ],
      q: "How does the receptionist solve the problem?", qVi: "Lễ tân giải quyết thế nào?", options: ["Gives a refund", "Offers a free upgrade", "Moves the guest to another hotel"], answer: 1,
    },
    shadowing: [
      { en: "I'm afraid there's been a mix-up with my booking.", vi: "E là có nhầm lẫn với đặt phòng của tôi." },
      { en: "The air conditioner in my room is out of order.", vi: "Điều hòa phòng tôi bị hỏng." },
      { en: "Could you sort it out as soon as possible?", vi: "Bạn giải quyết sớm nhất có thể được không?" },
    ],
    scenarioId: "hotel",
  },
  {
    id: "b1-2", level: "b1", icon: "✈️", minutes: 15, title: "At the Airport", titleVi: "Ở sân bay",
    vocab: [
      { en: "boarding pass", ipa: "/ˈbɔːdɪŋ pɑːs/", vi: "thẻ lên máy bay", ex: "Here's your boarding pass.", exVi: "Thẻ lên máy bay của bạn đây." },
      { en: "delayed", ipa: "/dɪˈleɪd/", vi: "bị hoãn", ex: "Our flight is delayed.", exVi: "Chuyến bay bị hoãn." },
      { en: "connecting flight", ipa: "/kəˈnektɪŋ flaɪt/", vi: "chuyến nối", ex: "I'll miss my connecting flight.", exVi: "Tôi sẽ lỡ chuyến nối." },
      { en: "carry-on", ipa: "/ˈkæri ɒn/", vi: "hành lý xách tay", ex: "Is this OK as a carry-on?", exVi: "Cái này mang xách tay được không?" },
      { en: "gate", ipa: "/ɡeɪt/", vi: "cửa ra máy bay", ex: "Boarding at gate 12.", exVi: "Lên máy bay ở cửa 12." },
    ],
    listening: {
      lines: [
        { who: "Announcer", en: "Attention please. Flight VN 214 to Singapore is delayed by two hours. Boarding will now take place at gate 9.", vi: "Xin chú ý. Chuyến VN 214 đi Singapore bị hoãn hai tiếng. Lên máy bay tại cửa 9." },
      ],
      q: "Which gate is the new gate?", qVi: "Cửa lên máy bay mới là cửa số mấy?", options: ["Gate 2", "Gate 9", "Gate 14"], answer: 1,
    },
    shadowing: [
      { en: "My flight has been delayed by two hours.", vi: "Chuyến bay của tôi bị hoãn hai tiếng." },
      { en: "I'm worried I'll miss my connecting flight.", vi: "Tôi lo sẽ lỡ chuyến nối." },
      { en: "Could you rebook me on the next flight?", vi: "Bạn đổi giúp tôi sang chuyến tiếp theo được không?" },
    ],
    scenarioId: "hotel",
  },
  {
    id: "b1-3", level: "b1", icon: "👥", minutes: 15, title: "Team Meetings", titleVi: "Họp nhóm",
    vocab: [
      { en: "agenda", ipa: "/əˈdʒendə/", vi: "chương trình họp", ex: "Let's stick to the agenda.", exVi: "Hãy bám theo chương trình họp." },
      { en: "deadline", ipa: "/ˈdedlaɪn/", vi: "hạn chót", ex: "The deadline is Friday.", exVi: "Hạn chót là thứ Sáu." },
      { en: "in charge of", ipa: "/ɪn tʃɑːdʒ əv/", vi: "phụ trách", ex: "Who's in charge of the slides?", exVi: "Ai phụ trách slide?" },
      { en: "follow up", ipa: "/ˈfɒləʊ ʌp/", vi: "theo dõi tiếp", ex: "I'll follow up by email.", exVi: "Tôi sẽ gửi email theo dõi." },
      { en: "on the same page", ipa: "/ɒn ðə seɪm peɪdʒ/", vi: "cùng quan điểm", ex: "Are we all on the same page?", exVi: "Mọi người đã thống nhất chưa?" },
    ],
    listening: {
      lines: [
        { who: "Manager", en: "OK, so the report deadline is next Friday. Hoa, can you be in charge of the data?", vi: "Hạn báo cáo là thứ Sáu tới. Hoa phụ trách phần dữ liệu nhé?" },
        { who: "Hoa", en: "Sure. I'll send a draft by Wednesday so we can review it.", vi: "Được. Em sẽ gửi bản nháp trước thứ Tư để mọi người xem." },
      ],
      q: "When will Hoa send the draft?", qVi: "Khi nào Hoa gửi bản nháp?", options: ["Monday", "Wednesday", "Friday"], answer: 1,
    },
    shadowing: [
      { en: "Let's go over the agenda first.", vi: "Hãy điểm qua chương trình họp trước." },
      { en: "I'll be in charge of the data analysis.", vi: "Tôi sẽ phụ trách phân tích dữ liệu." },
      { en: "Just to make sure we're on the same page...", vi: "Để chắc chắn mọi người cùng hiểu..." },
    ],
    scenarioId: "meeting",
  },
  // ============ B2 ============
  {
    id: "b2-1", level: "b2", icon: "💼", minutes: 15, title: "Job Interview", titleVi: "Phỏng vấn xin việc",
    vocab: [
      { en: "strength", ipa: "/streŋθ/", vi: "điểm mạnh", ex: "My main strength is problem-solving.", exVi: "Điểm mạnh chính của tôi là giải quyết vấn đề." },
      { en: "take the initiative", ipa: "/teɪk ðə ɪˈnɪʃətɪv/", vi: "chủ động", ex: "I took the initiative to fix the process.", exVi: "Tôi chủ động cải tiến quy trình." },
      { en: "under pressure", ipa: "/ˈʌndə ˈpreʃə/", vi: "dưới áp lực", ex: "I work well under pressure.", exVi: "Tôi làm việc tốt dưới áp lực." },
      { en: "track record", ipa: "/træk ˈrekɔːd/", vi: "thành tích đã chứng minh", ex: "She has a strong track record.", exVi: "Cô ấy có thành tích tốt." },
      { en: "career goals", ipa: "/kəˈrɪə ɡəʊlz/", vi: "mục tiêu nghề nghiệp", ex: "My career goals align with this role.", exVi: "Mục tiêu nghề nghiệp của tôi phù hợp vị trí này." },
    ],
    listening: {
      lines: [
        { who: "Interviewer", en: "Tell me about a time you faced a difficult deadline.", vi: "Kể về lần bạn đối mặt với hạn chót khó khăn." },
        { who: "Candidate", en: "Last year our client moved the launch forward by two weeks. I reorganised the tasks, took on the testing myself, and we delivered on time.", vi: "Năm ngoái khách hàng dời ngày ra mắt sớm hai tuần. Tôi sắp xếp lại công việc, tự đảm nhận phần kiểm thử và chúng tôi bàn giao đúng hạn." },
      ],
      q: "What did the candidate do himself?", qVi: "Ứng viên tự làm việc gì?", options: ["Hired new staff", "Did the testing", "Asked for more time"], answer: 1,
    },
    shadowing: [
      { en: "I'd say my greatest strength is my ability to stay calm under pressure.", vi: "Điểm mạnh lớn nhất của tôi là giữ bình tĩnh dưới áp lực." },
      { en: "I took the initiative to streamline our workflow.", vi: "Tôi chủ động tinh gọn quy trình làm việc." },
      { en: "Where do you see the company in five years?", vi: "Anh/chị thấy công ty sẽ ra sao trong 5 năm tới?" },
    ],
    scenarioId: "interview",
  },
  {
    id: "b2-2", level: "b2", icon: "🤝", minutes: 15, title: "Negotiating", titleVi: "Thương lượng",
    vocab: [
      { en: "meet halfway", ipa: "/miːt ˌhɑːfˈweɪ/", vi: "nhượng bộ mỗi bên một nửa", ex: "Could we meet halfway on the price?", exVi: "Mỗi bên nhượng một nửa giá được không?" },
      { en: "deal-breaker", ipa: "/ˈdiːl breɪkə/", vi: "điều kiện tiên quyết", ex: "Late delivery is a deal-breaker.", exVi: "Giao trễ là điều không chấp nhận được." },
      { en: "in return", ipa: "/ɪn rɪˈtɜːn/", vi: "đổi lại", ex: "In return, we'll sign for two years.", exVi: "Đổi lại, chúng tôi ký hai năm." },
      { en: "flexible", ipa: "/ˈfleksəbl/", vi: "linh hoạt", ex: "We're flexible on the timeline.", exVi: "Chúng tôi linh hoạt về thời gian." },
      { en: "bottom line", ipa: "/ˈbɒtəm laɪn/", vi: "mức giới hạn cuối", ex: "What's your bottom line?", exVi: "Mức thấp nhất bên bạn là bao nhiêu?" },
    ],
    listening: {
      lines: [
        { who: "Supplier", en: "Our best price is nine dollars per unit.", vi: "Giá tốt nhất của chúng tôi là 9 đô một sản phẩm." },
        { who: "Buyer", en: "If we double the order, could you go down to eight?", vi: "Nếu chúng tôi đặt gấp đôi, anh giảm xuống 8 đô được không?" },
        { who: "Supplier", en: "Let's meet halfway — eight fifty.", vi: "Mỗi bên nhường một nửa — 8,5 đô nhé." },
      ],
      q: "What is the final price?", qVi: "Giá cuối cùng là bao nhiêu?", options: ["$8.00", "$8.50", "$9.00"], answer: 1,
    },
    shadowing: [
      { en: "If you can lower the price, we'd be happy to increase our order.", vi: "Nếu anh giảm giá, chúng tôi sẵn sàng tăng đơn hàng." },
      { en: "That's a bit beyond our budget, to be honest.", vi: "Thành thật mà nói, mức đó hơi vượt ngân sách." },
      { en: "Could we meet halfway?", vi: "Mỗi bên nhượng bộ một chút được không?" },
    ],
    scenarioId: "interview",
  },
  {
    id: "b2-3", level: "b2", icon: "📢", minutes: 15, title: "Giving Opinions", titleVi: "Bày tỏ quan điểm",
    vocab: [
      { en: "from my perspective", ipa: "/frəm maɪ pəˈspektɪv/", vi: "theo góc nhìn của tôi", ex: "From my perspective, it's worth it.", exVi: "Theo tôi, việc đó đáng làm." },
      { en: "on the other hand", ipa: "/ɒn ði ˈʌðə hænd/", vi: "mặt khác", ex: "On the other hand, it's costly.", exVi: "Mặt khác, nó tốn kém." },
      { en: "I see your point, but...", ipa: "", vi: "tôi hiểu ý bạn, nhưng...", ex: "I see your point, but I disagree.", exVi: "Tôi hiểu ý bạn, nhưng tôi không đồng ý." },
      { en: "drawback", ipa: "/ˈdrɔːbæk/", vi: "nhược điểm", ex: "The main drawback is the cost.", exVi: "Nhược điểm chính là chi phí." },
      { en: "outweigh", ipa: "/ˌaʊtˈweɪ/", vi: "lớn hơn, vượt trội", ex: "The benefits outweigh the risks.", exVi: "Lợi ích lớn hơn rủi ro." },
    ],
    listening: {
      lines: [
        { who: "A", en: "I think working from home is better for everyone.", vi: "Mình nghĩ làm việc tại nhà tốt hơn cho mọi người." },
        { who: "B", en: "I see your point, but on the other hand, it's harder to build team spirit.", vi: "Mình hiểu ý bạn, nhưng mặt khác, khó xây dựng tinh thần đồng đội hơn." },
      ],
      q: "What is B's concern?", qVi: "B lo ngại điều gì?", options: ["Cost", "Team spirit", "Internet speed"], answer: 1,
    },
    shadowing: [
      { en: "From my perspective, the benefits outweigh the drawbacks.", vi: "Theo tôi, lợi ích lớn hơn nhược điểm." },
      { en: "I see your point, but I'm not entirely convinced.", vi: "Tôi hiểu ý bạn, nhưng chưa hoàn toàn bị thuyết phục." },
      { en: "That's a fair point.", vi: "Đó là ý kiến hợp lý." },
    ],
    scenarioId: "meeting",
  },
  // ============ C1 ============
  {
    id: "c1-1", level: "c1", icon: "🧩", minutes: 15, title: "Idioms in Context", titleVi: "Thành ngữ trong ngữ cảnh",
    vocab: [
      { en: "the elephant in the room", ipa: "", vi: "vấn đề hiển nhiên mà ai cũng né tránh", ex: "Let's address the elephant in the room: the budget.", exVi: "Hãy nói thẳng vấn đề ai cũng né: ngân sách." },
      { en: "cut corners", ipa: "/kʌt ˈkɔːnəz/", vi: "làm ẩu để tiết kiệm", ex: "We can't afford to cut corners on safety.", exVi: "Không thể làm ẩu về an toàn." },
      { en: "a blessing in disguise", ipa: "", vi: "trong cái rủi có cái may", ex: "Losing that job was a blessing in disguise.", exVi: "Mất việc đó hóa ra lại là may." },
      { en: "hit the nail on the head", ipa: "", vi: "nói trúng vấn đề", ex: "You've hit the nail on the head.", exVi: "Bạn nói trúng phóc rồi." },
      { en: "back to square one", ipa: "", vi: "quay lại vạch xuất phát", ex: "The test failed, so we're back to square one.", exVi: "Thử nghiệm thất bại, ta lại về vạch xuất phát." },
    ],
    listening: {
      lines: [
        { who: "A", en: "The investor pulled out, so we're back to square one.", vi: "Nhà đầu tư rút lui, ta lại về vạch xuất phát." },
        { who: "B", en: "Maybe it's a blessing in disguise. Their terms were pretty harsh.", vi: "Có khi trong rủi có may. Điều khoản của họ khá khắt khe." },
      ],
      q: "How does B see the situation?", qVi: "B nhìn nhận tình huống thế nào?", options: ["As a disaster", "As possibly positive", "As someone's fault"], answer: 1,
    },
    shadowing: [
      { en: "Let's address the elephant in the room.", vi: "Hãy nói thẳng vào vấn đề ai cũng né." },
      { en: "We simply can't afford to cut corners.", vi: "Chúng ta không thể làm ẩu." },
      { en: "You've hit the nail on the head.", vi: "Bạn nói trúng vấn đề rồi." },
    ],
    scenarioId: "debate",
  },
  {
    id: "c1-2", level: "c1", icon: "🔗", minutes: 15, title: "Advanced Phrasal Verbs", titleVi: "Cụm động từ nâng cao",
    vocab: [
      { en: "bring about", ipa: "/brɪŋ əˈbaʊt/", vi: "gây ra, mang lại", ex: "AI has brought about huge changes.", exVi: "AI đã mang lại thay đổi lớn." },
      { en: "come across as", ipa: "", vi: "tạo ấn tượng là", ex: "He comes across as arrogant.", exVi: "Anh ta tạo cảm giác kiêu ngạo." },
      { en: "iron out", ipa: "/ˈaɪən aʊt/", vi: "giải quyết (vướng mắc nhỏ)", ex: "We need to iron out a few details.", exVi: "Cần giải quyết vài chi tiết." },
      { en: "phase out", ipa: "/feɪz aʊt/", vi: "loại bỏ dần", ex: "Plastic bags are being phased out.", exVi: "Túi ni-lông đang bị loại bỏ dần." },
      { en: "fall through", ipa: "/fɔːl θruː/", vi: "đổ bể, không thành", ex: "The deal fell through.", exVi: "Thương vụ đổ bể." },
    ],
    listening: {
      lines: [
        { who: "A", en: "The government plans to phase out coal power by 2040.", vi: "Chính phủ dự định loại bỏ dần điện than trước 2040." },
        { who: "B", en: "That could bring about real change, as long as the funding doesn't fall through.", vi: "Điều đó có thể tạo thay đổi thật sự, miễn là nguồn vốn không đổ bể." },
      ],
      q: "What is B's condition for success?", qVi: "Điều kiện thành công theo B là gì?", options: ["Public support", "Secure funding", "New technology"], answer: 1,
    },
    shadowing: [
      { en: "We still need to iron out a few details.", vi: "Ta vẫn cần giải quyết vài chi tiết." },
      { en: "The deal fell through at the last minute.", vi: "Thương vụ đổ bể vào phút chót." },
      { en: "I don't want to come across as rude.", vi: "Tôi không muốn tỏ ra bất lịch sự." },
    ],
    scenarioId: "debate",
  },
  {
    id: "c1-3", level: "c1", icon: "⚖️", minutes: 15, title: "Debate: AI in Education", titleVi: "Tranh biện: AI trong giáo dục",
    vocab: [
      { en: "concede", ipa: "/kənˈsiːd/", vi: "thừa nhận (một phần)", ex: "I concede that it saves time, but...", exVi: "Tôi thừa nhận nó tiết kiệm thời gian, nhưng..." },
      { en: "counterargument", ipa: "/ˈkaʊntərˌɑːɡjumənt/", vi: "lập luận phản bác", ex: "Let me raise a counterargument.", exVi: "Cho tôi nêu một phản biện." },
      { en: "undermine", ipa: "/ˌʌndəˈmaɪn/", vi: "làm suy yếu", ex: "Over-reliance may undermine critical thinking.", exVi: "Phụ thuộc quá mức có thể làm suy yếu tư duy phản biện." },
      { en: "by and large", ipa: "", vi: "nhìn chung", ex: "By and large, the results were positive.", exVi: "Nhìn chung, kết quả tích cực." },
      { en: "it stands to reason", ipa: "", vi: "hợp lý là", ex: "It stands to reason that practice matters.", exVi: "Hợp lý khi nói luyện tập là quan trọng." },
    ],
    listening: {
      lines: [
        { who: "Speaker 1", en: "AI tutors give every student personalised feedback, which teachers simply can't do at scale.", vi: "Gia sư AI cho mỗi học sinh phản hồi cá nhân hóa, điều giáo viên không thể làm ở quy mô lớn." },
        { who: "Speaker 2", en: "I concede that, but over-reliance may undermine students' ability to think independently.", vi: "Tôi thừa nhận, nhưng phụ thuộc quá mức có thể làm suy yếu khả năng tư duy độc lập." },
      ],
      q: "What is Speaker 2's main worry?", qVi: "Người nói 2 lo ngại điều gì?", options: ["Cost of AI", "Loss of independent thinking", "Teacher unemployment"], answer: 1,
    },
    shadowing: [
      { en: "While I concede that point, I'd argue the opposite is also true.", vi: "Dù tôi thừa nhận điểm đó, tôi cho rằng điều ngược lại cũng đúng." },
      { en: "Over-reliance on AI may undermine critical thinking.", vi: "Phụ thuộc AI quá mức có thể làm suy yếu tư duy phản biện." },
      { en: "By and large, the evidence supports a balanced approach.", vi: "Nhìn chung, bằng chứng ủng hộ cách tiếp cận cân bằng." },
    ],
    scenarioId: "debate",
  },
];

export const lessonsByLevel = (level: LevelId) => LESSONS.filter((l) => l.level === level);
export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);

// -------------------------------------------------------------
// Tình huống hội thoại AI (Roleplay)
// -------------------------------------------------------------
export interface Scenario {
  id: string;
  level: LevelId;
  icon: string;
  title: string;
  titleVi: string;
  aiRole: string;
  goalVi: string;
  opener: string;
  openerVi: string;
  hints: { en: string; vi: string }[];
}

export const SCENARIOS: Scenario[] = [
  { id: "meet", level: "pre", icon: "👋", title: "Meeting someone new", titleVi: "Làm quen bạn mới", aiRole: "a friendly new classmate called Emma",
    goalVi: "Chào hỏi, nói tên, quê quán và một sở thích.", opener: "Hi! I'm Emma. What's your name?", openerVi: "Chào! Mình là Emma. Bạn tên gì?",
    hints: [{ en: "Hi Emma, my name is ...", vi: "Chào Emma, tên mình là ..." }, { en: "I'm from Vietnam.", vi: "Mình đến từ Việt Nam." }, { en: "Nice to meet you!", vi: "Rất vui được gặp bạn!" }] },
  { id: "market", level: "a1", icon: "🛒", title: "At the market", titleVi: "Đi chợ / mua sắm", aiRole: "a shop assistant at a clothes shop",
    goalVi: "Hỏi giá, hỏi cỡ, mặc cả và thanh toán.", opener: "Hello! Can I help you?", openerVi: "Xin chào! Tôi giúp gì được cho bạn?",
    hints: [{ en: "How much is this T-shirt?", vi: "Áo phông này bao nhiêu tiền?" }, { en: "Do you have a bigger size?", vi: "Có cỡ lớn hơn không?" }, { en: "Can I pay by card?", vi: "Tôi trả bằng thẻ được không?" }] },
  { id: "cafe", level: "a2", icon: "☕", title: "Ordering at a café", titleVi: "Gọi đồ ở quán cà phê", aiRole: "a barista at a busy coffee shop",
    goalVi: "Gọi một đồ uống, chọn cỡ, đường/đá và thanh toán.", opener: "Hi there! What can I get for you today?", openerVi: "Chào bạn! Hôm nay bạn muốn dùng gì?",
    hints: [{ en: "I'd like an iced latte, please.", vi: "Cho tôi một ly latte đá." }, { en: "Medium, less sugar.", vi: "Cỡ vừa, ít đường." }, { en: "To go, please.", vi: "Mang đi nhé." }] },
  { id: "directions", level: "a2", icon: "🗺️", title: "Asking for directions", titleVi: "Hỏi đường", aiRole: "a helpful local in London",
    goalVi: "Hỏi đường đến ga tàu và xác nhận lại chỉ dẫn.", opener: "You look a bit lost. Can I help?", openerVi: "Trông bạn có vẻ bị lạc. Tôi giúp được không?",
    hints: [{ en: "How do I get to the station?", vi: "Đến ga tàu đi thế nào?" }, { en: "Is it far from here?", vi: "Có xa đây không?" }, { en: "So I turn left at the bank?", vi: "Vậy tôi rẽ trái ở ngân hàng à?" }] },
  { id: "hotel", level: "b1", icon: "🏨", title: "Hotel problem", titleVi: "Xử lý sự cố khách sạn", aiRole: "a hotel receptionist; the guest's room has a problem",
    goalVi: "Phàn nàn lịch sự về phòng và đề nghị cách giải quyết.", opener: "Good evening, front desk. How can I help you?", openerVi: "Chào buổi tối, quầy lễ tân xin nghe. Tôi giúp gì được ạ?",
    hints: [{ en: "I'm afraid the air conditioner isn't working.", vi: "E là điều hòa không hoạt động." }, { en: "Could I change to another room?", vi: "Tôi đổi phòng khác được không?" }, { en: "How long will it take?", vi: "Mất bao lâu?" }] },
  { id: "meeting", level: "b1", icon: "👥", title: "Team meeting", titleVi: "Họp nhóm dự án", aiRole: "a project manager running a weekly team meeting",
    goalVi: "Báo cáo tiến độ, nêu khó khăn và đề xuất giải pháp.", opener: "Morning everyone. Let's start with updates. How's your part going?", openerVi: "Chào mọi người. Bắt đầu cập nhật nhé. Phần của bạn thế nào rồi?",
    hints: [{ en: "I'm about 70% done with the report.", vi: "Tôi xong khoảng 70% báo cáo." }, { en: "I'm a bit behind because...", vi: "Tôi hơi chậm vì..." }, { en: "Could someone help me with the data?", vi: "Ai đó giúp tôi phần dữ liệu được không?" }] },
  { id: "interview", level: "b2", icon: "💼", title: "Job interview", titleVi: "Phỏng vấn xin việc", aiRole: "a hiring manager interviewing for a marketing executive position",
    goalVi: "Trả lời câu hỏi phỏng vấn theo cấu trúc STAR, hỏi lại nhà tuyển dụng.", opener: "Thanks for coming in. To start, could you tell me a little about yourself?", openerVi: "Cảm ơn bạn đã đến. Đầu tiên, bạn giới thiệu đôi chút về bản thân nhé?",
    hints: [{ en: "I have three years of experience in...", vi: "Tôi có ba năm kinh nghiệm về..." }, { en: "My greatest strength is...", vi: "Điểm mạnh lớn nhất của tôi là..." }, { en: "What does a typical day look like in this role?", vi: "Một ngày làm việc điển hình ở vị trí này thế nào?" }] },
  { id: "debate", level: "c1", icon: "⚖️", title: "Debate: AI in schools", titleVi: "Tranh biện: AI trong trường học", aiRole: "a sharp debate opponent arguing that AI should be banned from schools",
    goalVi: "Phản biện, nhượng bộ có chiến lược, dùng ngôn ngữ trang trọng và idioms.", opener: "Let me be blunt: AI in classrooms is doing more harm than good. Students are outsourcing their thinking. Convince me otherwise.", openerVi: "Nói thẳng nhé: AI trong lớp học đang gây hại nhiều hơn lợi. Học sinh đang thuê ngoài tư duy của mình. Hãy thuyết phục tôi điều ngược lại.",
    hints: [{ en: "While I concede that some students misuse it, ...", vi: "Dù tôi thừa nhận một số học sinh lạm dụng, ..." }, { en: "The real issue isn't the tool, but how it's used.", vi: "Vấn đề không nằm ở công cụ mà ở cách dùng." }, { en: "By and large, the evidence suggests...", vi: "Nhìn chung, bằng chứng cho thấy..." }] },
];

export const scenarioById = (id: string) => SCENARIOS.find((s) => s.id === id)!;

// -------------------------------------------------------------
// Test đầu vào
// -------------------------------------------------------------
export interface PlacementQ {
  kind: "listen" | "vocab";
  level: LevelId;
  prompt: string;
  audio?: string;
  options: string[];
  answer: number;
}

export const PLACEMENT_QUESTIONS: PlacementQ[] = [
  { kind: "listen", level: "pre", prompt: "Nghe và chọn từ bạn nghe được", audio: "Thank you", options: ["Thank you", "Sorry", "Goodbye"], answer: 0 },
  { kind: "listen", level: "a1", prompt: "What time is it?", audio: "It's half past seven.", options: ["7:00", "7:30", "6:30"], answer: 1 },
  { kind: "listen", level: "a2", prompt: "Where does the woman want to go?", audio: "Excuse me, could you tell me the way to the nearest pharmacy?", options: ["A bank", "A pharmacy", "A hospital"], answer: 1 },
  { kind: "listen", level: "b1", prompt: "Why is the man calling?", audio: "Hi, I'm calling about the order I placed last week. It still hasn't arrived and the tracking page hasn't been updated.", options: ["To place an order", "To complain about a delay", "To cancel his account"], answer: 1 },
  { kind: "listen", level: "b2", prompt: "What is the speaker's attitude?", audio: "Frankly, I'm not convinced the new policy will make much of a difference, though I'm willing to give it a chance.", options: ["Enthusiastic", "Sceptical but open", "Completely against it"], answer: 1 },
  { kind: "vocab", level: "pre", prompt: "My mother is a ___. She works in a hospital.", options: ["nurse", "farmer", "driver"], answer: 0 },
  { kind: "vocab", level: "a1", prompt: "I ___ to school by bike every day.", options: ["goes", "go", "going"], answer: 1 },
  { kind: "vocab", level: "a2", prompt: "Can I ___ this jacket on?", options: ["wear", "try", "put"], answer: 1 },
  { kind: "vocab", level: "b1", prompt: "Our flight was ___ because of the storm.", options: ["delayed", "postponed off", "late on"], answer: 0 },
  { kind: "vocab", level: "b2", prompt: "The benefits of the plan clearly ___ the risks.", options: ["outweigh", "overcome", "overtake"], answer: 0 },
  { kind: "vocab", level: "c1", prompt: "The deal ___ at the last minute, so we're back to square one.", options: ["fell through", "fell out", "fell behind"], answer: 0 },
  { kind: "vocab", level: "c1", prompt: "Let's address the ___ in the room: we're over budget.", options: ["elephant", "lion", "ghost"], answer: 0 },
];

export const PLACEMENT_READ: { en: string; level: LevelId }[] = [
  { en: "Hello, my name is Nam.", level: "pre" },
  { en: "I usually go to work by motorbike.", level: "a1" },
  { en: "Could you tell me the way to the station?", level: "a2" },
  { en: "I'm afraid there's been a mix-up with my booking.", level: "b1" },
  { en: "From my perspective, the benefits clearly outweigh the drawbacks.", level: "b2" },
];

// -------------------------------------------------------------
// Huy hiệu
// -------------------------------------------------------------
export const BADGES = [
  { id: "first", icon: "🌱", vi: "Bước đầu tiên", desc: "Hoàn thành bài học đầu tiên" },
  { id: "streak3", icon: "🔥", vi: "Lửa 3 ngày", desc: "Học 3 ngày liên tiếp" },
  { id: "streak7", icon: "⚡", vi: "Chiến binh 7 ngày", desc: "Học 7 ngày liên tiếp" },
  { id: "xp500", icon: "💎", vi: "500 XP", desc: "Đạt 500 điểm kinh nghiệm" },
  { id: "talker", icon: "🗣️", vi: "Người thích nói", desc: "Gửi 20 câu cho Gia sư AI" },
  { id: "ipa", icon: "👄", vi: "Bậc thầy IPA", desc: "Luyện 20 âm IPA" },
  { id: "pron90", icon: "🎯", vi: "Phát âm chuẩn", desc: "Đạt ≥ 90% ở Phòng phát âm" },
  { id: "levelup", icon: "🏆", vi: "Lên cấp", desc: "Hoàn thành mọi bài của một cấp độ" },
] as const;
