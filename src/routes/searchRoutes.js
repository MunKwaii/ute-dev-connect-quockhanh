const express = require('express');
const router = express.Router();
const { optionalToken } = require('../middlewares/authMiddleware');
const searchController = require('../controllers/searchController');

// @route   GET /api/search
// @desc    Tìm kiếm tổng hợp
// @query   q=<keyword>&type=posts|groups|developers&tag=<tag>&skill=<skill>&page=1&limit=10
// @access  Public
router.get('/', optionalToken, searchController.searchAll);

module.exports = router;
