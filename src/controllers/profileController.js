const profileService = require('../services/profileService');

/**
 * Controller: Cập nhật hoặc tạo mới hồ sơ người dùng (Edit Profile)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const editProfile = async (req, res) => {
    try {
        // Lấy userId từ req.user (đã được gán bởi authMiddleware)
        const userId = req.user.id;

        // Trích xuất các trường từ body request
        const {
            faculty, classCode, company, website, location, status, skills, bio, githubusername,
            youtube, twitter, facebook, linkedin, instagram
        } = req.body;

        // Xây dựng object profileFields để lưu vào database
        const profileFields = {};
        profileFields.user = userId; // Gán ID user

        if (faculty) profileFields.faculty = faculty;
        if (classCode) profileFields.classCode = classCode;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (status) profileFields.status = status;
        if (bio) profileFields.bio = bio;
        if (githubusername) profileFields.githubusername = githubusername;

        // Xử lý mảng skills: chia chuỗi thành mảng bằng dấu phẩy và xóa khoảng trắng 2 đầu
        if (skills) {
            profileFields.skills = Array.isArray(skills) 
                ? skills 
                : skills.split(',').map(skill => skill.trim());
        }

        // Xây dựng object social
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        // Gọi hàm từ Service để xử lý logic update/create
        const profile = await profileService.updateUserProfile(userId, profileFields);

        // Trả về JSON status 200 kèm dữ liệu profile
        return res.status(200).json(profile);
    } catch (error) {
        console.error('Lỗi ở editProfile controller:', error.message);
        return res.status(500).json({ msg: 'Lỗi máy chủ (Server Error)' });
    }
};

/**
 * Controller: Lấy hồ sơ của người dùng hiện tại
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getCurrentProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[getCurrentProfile] Bắt đầu lấy profile cho user: ${userId}`);
        const profile = await profileService.getProfileByUserId(userId);

        if (!profile) {
            console.log(`[getCurrentProfile] Không tìm thấy profile cho user: ${userId}`);
            return res.status(404).json({ msg: 'Không tìm thấy hồ sơ cho người dùng này' });
        }

        console.log(`[getCurrentProfile] Đã tìm thấy profile, trả về data.`);
        return res.status(200).json(profile);
    } catch (error) {
        console.error('Lỗi ở getCurrentProfile controller:', error.message);
        return res.status(500).json({ msg: 'Lỗi máy chủ (Server Error)' });
    }
};

/**
 * Controller: Lấy tất cả hồ sơ người dùng
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAllProfiles = async (req, res) => {
    try {
        const profiles = await profileService.getAllProfiles();
        return res.status(200).json(profiles);
    } catch (error) {
        console.error('Lỗi ở getAllProfiles controller:', error.message);
        return res.status(500).json({ msg: 'Lỗi máy chủ (Server Error)' });
    }
};

/**
 * Controller: Lấy hồ sơ người dùng theo ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getProfileById = async (req, res) => {
    try {
        const profile = await profileService.getProfileByUserId(req.params.user_id);

        if (!profile) {
            return res.status(404).json({ msg: 'Không tìm thấy hồ sơ cho người dùng này' });
        }

        return res.status(200).json(profile);
    } catch (error) {
        console.error('Lỗi ở getProfileById controller:', error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Không tìm thấy hồ sơ cho người dùng này' });
        }
        return res.status(500).json({ msg: 'Lỗi máy chủ (Server Error)' });
    }
};

/**
 * Controller: Lấy top 10 lập trình viên nổi bật
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getTopDevelopers = async (req, res) => {
    try {
        const developers = await profileService.getTopDevelopers();
        return res.status(200).json(developers);
    } catch (error) {
        console.error('Lỗi ở getTopDevelopers controller:', error.message);
        return res.status(500).json({ msg: 'Lỗi máy chủ (Server Error)' });
    }
};

module.exports = {
    editProfile,
    getCurrentProfile,
    getAllProfiles,
    getProfileById,
    getTopDevelopers
};

