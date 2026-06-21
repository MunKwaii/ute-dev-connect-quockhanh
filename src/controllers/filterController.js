const filterService = require('../services/filterService');
const Filter = require('../models/Filter');

// Lấy cấu hình bộ lọc hiện tại
const getFilterConfig = async (req, res) => {
  try {
    const config = await filterService.getOrCreateFilter();
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

// Thêm từ cấm
const addBannedWord = async (req, res) => {
  try {
    const { word } = req.body;
    if (!word || !word.trim()) {
      return res.status(400).json({ success: false, message: 'Từ cấm không được để trống' });
    }

    const filter = await filterService.getOrCreateFilter();
    const cleanWord = word.trim();
    if (filter.bannedWords.some(w => w.toLowerCase() === cleanWord.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Từ cấm này đã tồn tại' });
    }

    filter.bannedWords.push(cleanWord);
    await filter.save();

    res.status(200).json({
      success: true,
      message: 'Thêm từ cấm thành công',
      data: filter
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

// Xóa từ cấm
const deleteBannedWord = async (req, res) => {
  try {
    const { word } = req.params;
    const filter = await filterService.getOrCreateFilter();
    const decodedWord = decodeURIComponent(word).trim().toLowerCase();
    
    filter.bannedWords = filter.bannedWords.filter(
      (w) => w.toLowerCase() !== decodedWord
    );
    await filter.save();

    res.status(200).json({
      success: true,
      message: 'Xóa từ cấm thành công',
      data: filter
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

// Bật/tắt AI Filter
const toggleAiFilter = async (req, res) => {
  try {
    const { enabled } = req.body;
    const filter = await filterService.getOrCreateFilter();
    filter.aiFilterEnabled = !!enabled;
    await filter.save();

    res.status(200).json({
      success: true,
      message: `Đã ${filter.aiFilterEnabled ? 'bật' : 'tắt'} bộ lọc AI thành công`,
      data: filter
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

module.exports = {
  getFilterConfig,
  addBannedWord,
  deleteBannedWord,
  toggleAiFilter
};
