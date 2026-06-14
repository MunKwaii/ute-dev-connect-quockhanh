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

/**
 * Lấy hồ sơ người dùng theo ID
 * @param {String} userId - ID của người dùng
 * @returns {Object} - Hồ sơ người dùng
 */
const getProfileByUserId = async (userId) => {
    try {
        const profile = await Profile.findOne({ user: userId }).populate('user', ['name', 'avatar', 'followers', 'following', 'reputation']);
        return profile;
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy tất cả hồ sơ người dùng
 * @returns {Array} - Danh sách tất cả hồ sơ
 */
const getAllProfiles = async () => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar', 'followers', 'following', 'reputation']);
        return profiles;
    } catch (error) {
        throw error;
    }
};

const getTopDevelopers = async () => {
    try {
        const developers = await Profile.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "user",
                    foreignField: "user",
                    as: "posts"
                }
            },
            {
                $addFields: {
                    postCount: { $size: "$posts" },
                    skillsCount: { $size: { $ifNull: ["$skills", []] } },
                    experienceCount: { $size: { $ifNull: ["$experience", []] } }
                }
            },
            {
                $sort: {
                    postCount: -1,
                    skillsCount: -1,
                    experienceCount: -1
                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    user: {
                        _id: "$userDetails._id",
                        name: "$userDetails.name",
                        avatar: "$userDetails.avatar",
                        followers: "$userDetails.followers",
                        following: "$userDetails.following"
                    },
                    faculty: 1,
                    classCode: 1,
                    company: 1,
                    website: 1,
                    location: 1,
                    status: 1,
                    skills: 1,
                    bio: 1,
                    githubusername: 1,
                    experience: 1,
                    education: 1,
                    social: 1,
                    date: 1,
                    postCount: 1,
                    skillsCount: 1,
                    experienceCount: 1
                }
            }
        ]);
        return developers;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    updateUserProfile,
    getProfileByUserId,
    getAllProfiles,
    getTopDevelopers
};

