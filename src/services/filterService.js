const Filter = require('../models/Filter');

// Khởi tạo hoặc lấy cấu hình bộ lọc từ DB
const getOrCreateFilter = async () => {
  let filter = await Filter.findOne();
  if (!filter) {
    filter = new Filter({
      bannedWords: ['đm', 'dcm', 'fuck', 'toxicword', 'quang cao tool'],
      aiFilterEnabled: false
    });
    await filter.save();
  }
  return filter;
};

// Kiểm tra nội dung dựa trên từ cấm và bộ lọc AI
const checkContent = async (text) => {
  if (!text) return;
  const filter = await getOrCreateFilter();
  const normalizedText = text.toLowerCase();

  // 1. Kiểm tra từ cấm thủ công
  for (const word of filter.bannedWords) {
    if (normalizedText.includes(word.toLowerCase())) {
      const error = new Error(`Nội dung chứa từ cấm không cho phép: "${word}"`);
      error.statusCode = 400;
      throw error;
    }
  }

  // 2. Kiểm tra bằng AI (nếu được bật)
  if (filter.aiFilterEnabled) {
    // Giả lập AI phân tích ngữ nghĩa để phát hiện spam, quảng cáo, hack hoặc nội dung độc hại
    const aiSpamPatterns = [
      /hack/i, 
      /cung cap tool/i, 
      /phần mềm hack/i, 
      /quang cao/i, 
      /mua ban tài khoản/i, 
      /kiếm tiền online/i, 
      /nạp thẻ/i, 
      /dich vu hack/i,
      /spam/i
    ];
    for (const pattern of aiSpamPatterns) {
      if (pattern.test(normalizedText)) {
        const error = new Error('[AI Moderation] Phát hiện bài đăng/bình luận vi phạm chính sách nội dung (Spam/Quảng cáo/Hack/Nội dung độc hại)');
        error.statusCode = 400;
        throw error;
      }
    }
  }
};

module.exports = {
  getOrCreateFilter,
  checkContent
};
