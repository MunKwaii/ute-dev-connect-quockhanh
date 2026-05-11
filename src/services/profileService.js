const Profile = require('../models/Profile');

/**
 * Cập nhật hoặc tạo mới hồ sơ người dùng
 * @param {String} userId - ID của người dùng
 * @param {Object} profileFields - Các trường dữ liệu của hồ sơ
 * @returns {Object} - Hồ sơ đã được cập nhật hoặc tạo mới
 */
const updateUserProfile = async (userId, profileFields) => {
    try {
        // Tìm kiếm profile theo user ID
        let profile = await Profile.findOne({ user: userId });

        if (profile) {
            // Nếu Profile đã tồn tại -> Cập nhật (Update)
            profile = await Profile.findOneAndUpdate(
                { user: userId },
                { $set: profileFields },
                { new: true } // Trả về document mới sau khi cập nhật
            );
            return profile;
        }

        // Nếu Profile chưa tồn tại -> Tạo mới (Create)
        profile = new Profile(profileFields);
        await profile.save();
        
        return profile;
    } catch (error) {
        throw error; // Ném lỗi cho controller xử lý
    }
};

module.exports = {
    updateUserProfile
};
