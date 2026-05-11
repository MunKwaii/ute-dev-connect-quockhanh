const express = require('express');
const router = express.Router();

// 1. Import middlewares
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const { validateEditProfile } = require('../middlewares/validators/profileValidator');
const { profileLimiter } = require('../middlewares/rateLimiter');

// 2. Import controller
const profileController = require('../controllers/profileController');

// ==========================================
// CÁC ROUTE CỦA NHÓM (Từ nhánh develop)
// ==========================================

// @route   PUT /api/profile
// @desc    Tạo mới hoặc cập nhật thông tin hồ sơ (Edit Profile)
// @access  Private
// FIX LỖI: Đổi `authMiddleware` thành `verifyToken`
router.put('/profile', verifyToken, profileLimiter, validateEditProfile, profileController.editProfile);


// ==========================================
// CÁC ROUTE PHÂN QUYỀN (Từ nhánh feature/login của bạn)
// ==========================================

// API Profile cho User
router.get('/user/profile', verifyToken, authorizeRole('user'), (req, res) => {
    res.json({ success: true, message: 'Chào mừng User', userId: req.user.id });
});

// API Profile cho Admin
router.get('/admin/profile', verifyToken, authorizeRole('admin'), (req, res) => {
    res.json({ success: true, message: 'Chào mừng Admin, đây là khu vực quản trị', adminId: req.user.id });
});

module.exports = router;
