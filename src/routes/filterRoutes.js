const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const filterController = require('../controllers/filterController');
const User = require('../models/User');

// Middleware xác thực quyền Admin tổng
const verifyAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Chỉ Admin tổng hệ thống mới có quyền thực hiện hành động này' });
    }
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi xác thực quyền Admin' });
  }
};

router.get('/', [verifyToken, verifyAdmin], filterController.getFilterConfig);
router.post('/words', [verifyToken, verifyAdmin], filterController.addBannedWord);
router.delete('/words/:word', [verifyToken, verifyAdmin], filterController.deleteBannedWord);
router.put('/ai', [verifyToken, verifyAdmin], filterController.toggleAiFilter);

module.exports = router;
