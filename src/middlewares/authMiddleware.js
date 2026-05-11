const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Ưu tiên lấy header Authorization (hỗ trợ cả chữ hoa và thường)
    const authHeader = req.header('Authorization') || req.headers['authorization'];
    
    // Kiểm tra xem header có tồn tại và bắt đầu bằng 'Bearer ' không (Code của develop)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Không có token, từ chối truy cập' });
    }

    // Tách lấy token (bỏ qua chữ 'Bearer ')
    const token = authHeader.split(' ')[1];

    // Xác thực token bằng try...catch (Code của develop kết hợp format của bạn)
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ute_social_network_secret');
        
        // Gán user từ payload của token vào req 
        // (decoded.user || decoded giúp code của bạn không bị lỗi với các API cũ của nhóm)
        req.user = decoded.user || decoded;
        
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

// Hàm phân quyền do bạn viết (Code của feature/login)
const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        // Thêm req.user an toàn để tránh lỗi crash nếu req.user bị undefined
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ success: false, message: 'Không có quyền thực hiện hành động này' });
        }
        next();
    };
};

// MẸO QUAN TRỌNG: 
// Nếu code cũ của nhóm dùng cách import: const auth = require('...'); (nhập dưới dạng 1 hàm duy nhất)
// Thì bạn đổi dòng export này thành: 
// module.exports = verifyToken; 
// module.exports.authorizeRole = authorizeRole;

// Còn nếu nhóm đang dùng cách import: const { verifyToken } = require('...');
// Thì dùng dòng export này:
module.exports = { verifyToken, authorizeRole };