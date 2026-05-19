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

// @route   GET /api/profile/me
// @desc    Lấy hồ sơ của người dùng hiện tại
// @access  Private
router.get('/profile/me', verifyToken, profileController.getCurrentProfile);

// @route   GET /api/profile
// @desc    Lấy tất cả hồ sơ người dùng
// @access  Public
router.get('/profile', profileController.getAllProfiles);

// @route   GET /api/profile/top-developers
// @desc    Lấy top 10 lập trình viên nổi bật
// @access  Public
router.get('/profile/top-developers', profileController.getTopDevelopers);

// @route   GET /api/profile/user/:user_id
// @desc    Lấy hồ sơ người dùng theo user ID
// @access  Public
router.get('/profile/user/:user_id', profileController.getProfileById);


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
