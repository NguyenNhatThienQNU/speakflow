// Gia sư mô phỏng — dùng khi chưa cấu hình GEMINI_API_KEY (để trải nghiệm ngay)

const SCRIPTS: Record<string, { en: string; vi: string }[]> = {
  meet: [
    { en: "Nice to meet you! Where are you from?", vi: "Rất vui được gặp bạn! Bạn đến từ đâu?" },
    { en: "Cool! What do you like doing in your free time?", vi: "Hay quá! Lúc rảnh bạn thích làm gì?" },
    { en: "That sounds fun. How old are you?", vi: "Nghe vui đấy. Bạn bao nhiêu tuổi?" },
    { en: "Great talking to you! See you in class!", vi: "Nói chuyện với bạn vui lắm! Hẹn gặp ở lớp nhé!" },
  ],
  market: [
    { en: "Sure. This one is fifteen dollars. What size do you need?", vi: "Vâng. Cái này 15 đô. Bạn cần cỡ nào?" },
    { en: "Here you are. Would you like to try it on?", vi: "Của bạn đây. Bạn muốn mặc thử không?" },
    { en: "OK, I can give you ten percent off. Cash or card?", vi: "Được, tôi giảm cho bạn 10%. Tiền mặt hay thẻ?" },
    { en: "Thank you! Have a nice day!", vi: "Cảm ơn! Chúc bạn một ngày tốt lành!" },
  ],
  cafe: [
    { en: "Sure! What size would you like — small, medium or large?", vi: "Vâng! Bạn muốn cỡ nào — nhỏ, vừa hay lớn?" },
    { en: "Got it. Would you like it hot or iced?", vi: "Rõ rồi. Bạn muốn nóng hay đá?" },
    { en: "For here or to go?", vi: "Dùng ở đây hay mang đi?" },
    { en: "That's 4.50, please. Your drink will be ready in a minute!", vi: "Của bạn 4,5 đô. Đồ uống sẽ có trong một phút!" },
  ],
  directions: [
    { en: "Sure! Go straight down this street, then turn left at the bank.", vi: "Được! Đi thẳng đường này, rồi rẽ trái ở ngân hàng." },
    { en: "It's about ten minutes on foot. Not too far.", vi: "Đi bộ khoảng mười phút. Không xa lắm." },
    { en: "Yes, exactly. The station is opposite the park.", vi: "Đúng vậy. Ga tàu ở đối diện công viên." },
    { en: "You're welcome. Have a good trip!", vi: "Không có gì. Chúc chuyến đi vui vẻ!" },
  ],
  hotel: [
    { en: "I'm very sorry to hear that. Could you tell me your room number?", vi: "Rất tiếc về điều đó. Anh/chị cho biết số phòng được không?" },
    { en: "I'll send a technician right away. It should take about twenty minutes.", vi: "Tôi sẽ cử kỹ thuật viên ngay. Mất khoảng hai mươi phút." },
    { en: "Of course. We have a room on the 8th floor available. Would that work for you?", vi: "Tất nhiên. Chúng tôi còn một phòng ở tầng 8. Như vậy được không ạ?" },
    { en: "Done. I've also added a complimentary breakfast for the inconvenience.", vi: "Xong rồi ạ. Tôi tặng thêm bữa sáng miễn phí vì sự bất tiện này." },
  ],
  meeting: [
    { en: "Thanks for the update. What's the main thing slowing you down?", vi: "Cảm ơn cập nhật. Điều gì đang làm bạn chậm lại nhất?" },
    { en: "I see. What would you need from the team to get back on track?", vi: "Tôi hiểu. Bạn cần nhóm hỗ trợ gì để kịp tiến độ?" },
    { en: "That makes sense. Can you commit to a new deadline?", vi: "Hợp lý. Bạn có thể cam kết một hạn chót mới không?" },
    { en: "Great, let's follow up on Thursday. Thanks everyone.", vi: "Tốt, hẹn cập nhật lại vào thứ Năm. Cảm ơn mọi người." },
  ],
  interview: [
    { en: "Interesting. Could you give me an example of a challenge you faced at work and how you handled it?", vi: "Thú vị. Bạn có thể kể một thử thách trong công việc và cách bạn xử lý không?" },
    { en: "What would you say is your greatest weakness?", vi: "Theo bạn, điểm yếu lớn nhất của bạn là gì?" },
    { en: "Why do you want to work for our company specifically?", vi: "Vì sao bạn muốn làm việc cho công ty chúng tôi?" },
    { en: "Thank you. Do you have any questions for us?", vi: "Cảm ơn bạn. Bạn có câu hỏi nào cho chúng tôi không?" },
  ],
  debate: [
    { en: "That's a convenient argument, but doesn't easy access to answers erode the struggle that real learning requires?", vi: "Lập luận tiện lợi đấy, nhưng việc dễ dàng có đáp án chẳng phải làm mất đi sự vật lộn mà việc học thật sự cần sao?" },
    { en: "Even if teachers set guidelines, students will cut corners. How do you address that?", vi: "Kể cả khi giáo viên đặt quy định, học sinh vẫn sẽ làm tắt. Bạn giải quyết thế nào?" },
    { en: "I'll concede that point. But who should bear the cost of training teachers?", vi: "Tôi thừa nhận điểm đó. Nhưng ai sẽ chịu chi phí đào tạo giáo viên?" },
    { en: "A compelling case. Let's call it a draw — for now.", vi: "Lập luận thuyết phục. Tạm coi là hòa — lúc này." },
  ],
};

function quickCheck(text: string) {
  let corrected = text.trim();
  const notes: string[] = [];
  if (/^[a-z]/.test(corrected)) { corrected = corrected[0].toUpperCase() + corrected.slice(1); notes.push("Viết hoa chữ cái đầu câu."); }
  if (/\bi\b/.test(corrected)) { corrected = corrected.replace(/\bi\b/g, "I"); notes.push("Đại từ “I” (tôi) luôn viết hoa."); }
  const rules: [RegExp, string, string][] = [
    [/\bI is\b/gi, "I am", "Với “I” dùng “am”, không dùng “is”."],
    [/\b(he|she|it) (go|like|want|have|do)\b/gi, "", "Ngôi thứ 3 số ít (he/she/it) ở thì hiện tại đơn: động từ thêm -s/-es."],
    [/\bI am (go|like|want|play|work|live)\b/gi, "I $1", "Không dùng “am” trước động từ nguyên mẫu: nói “I go”, không nói “I am go”."],
    [/\bvery like\b/gi, "really like", "Người bản xứ nói “really like” hoặc “like ... very much”, không nói “very like”."],
    [/\bhow much (is )?cost\b/gi, "how much does it cost", "Câu hỏi giá: “How much does it cost?” hoặc “How much is it?”"],
  ];
  for (const [re, rep, note] of rules) {
    if (re.test(corrected)) {
      if (rep) corrected = corrected.replace(re, rep);
      else corrected = corrected.replace(re, (_m, p, v) => `${p} ${v === "have" ? "has" : v === "do" ? "does" : v === "go" ? "goes" : v + "s"}`);
      notes.push(note);
    }
  }
  if (!/[.!?]$/.test(corrected)) corrected += ".";
  return { hasError: notes.length > 0, corrected, notes };
}

export function mockReply(scenarioId: string, historyLen: number, userText: string, hints: { en: string; vi: string }[]) {
  const script = SCRIPTS[scenarioId] ?? SCRIPTS.meet;
  const turn = Math.min(script.length - 1, Math.floor(historyLen / 2));
  const { hasError, corrected, notes } = quickCheck(userText);
  return {
    reply: script[turn].en,
    replyVi: script[turn].vi,
    correction: {
      hasError,
      corrected,
      natural: corrected,
      explanationVi: hasError ? notes.join(" ") : "Câu của bạn ổn rồi! 👍 (Chế độ mô phỏng — thêm GEMINI_API_KEY để AI sửa lỗi chi tiết.)",
    },
    suggestions: hints,
  };
}
