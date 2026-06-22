const searchService = require('../services/searchService');

// @desc    Tìm kiếm tổng hợp: bài viết, nhóm, lập trình viên
// @route   GET /api/search?q=...&type=posts|groups|developers&tag=...&skill=...
// @access  Public
const searchAll = async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const type = req.query.type || 'posts'; // posts | groups | developers
    const tag = req.query.tag || '';
    const skill = req.query.skill || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    let result;
    const currentUserId = req.user?.id || req.user?._id || req.user?.userId || null;

    switch (type) {
      case 'posts':
        result = await searchService.searchPosts(keyword, tag, page, limit, currentUserId);
        return res.status(200).json({
          success: true,
          type: 'posts',
          keyword,
          tag,
          data: result.posts,
          total: result.total,
          hasMore: result.hasMore,
          page,
          limit,
        });

      case 'groups':
        result = await searchService.searchGroups(keyword, page, limit);
        return res.status(200).json({
          success: true,
          type: 'groups',
          keyword,
          data: result.groups,
          total: result.total,
          hasMore: result.hasMore,
          page,
          limit,
        });

      case 'developers':
        result = await searchService.searchDevelopers(keyword, skill, page, limit);
        return res.status(200).json({
          success: true,
          type: 'developers',
          keyword,
          skill,
          data: result.developers,
          total: result.total,
          hasMore: result.hasMore,
          page,
          limit,
        });

      default:
        return res.status(400).json({
          success: false,
          message: 'Loại tìm kiếm không hợp lệ. Dùng: posts | groups | developers',
        });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Lỗi Server' });
  }
};

module.exports = { searchAll };
