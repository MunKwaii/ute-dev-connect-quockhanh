const { body, validationResult } = require('express-validator');

// Hàm xử lý kết quả validation chung (giống trong authValidator.js)
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Middleware kiểm tra dữ liệu đầu vào cho Profile
const validateEditProfile = [
    body('status', 'Trạng thái (status) không được để trống').not().isEmpty(),
    body('skills', 'Kỹ năng (skills) không được để trống').not().isEmpty(),
    body('faculty', 'Khoa (faculty) không được để trống').not().isEmpty(),
    validateRequest
];

module.exports = {
    validateEditProfile
};
