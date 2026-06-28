const mongoose = require('mongoose');
const Post = require('./src/models/Post');
const postService = require('./src/services/postService');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected to MongoDB.");

    // Tìm bài viết trong group 6a32a8f506daa6e266c1d0f2
    const posts = await Post.find({ group: '6a32a8f506daa6e266c1d0f2' });
    console.log(`Tìm thấy ${posts.length} bài viết trong nhóm.`);

    for (const post of posts) {
      if (post.comments && post.comments.length > 0) {
        console.log(`Bài viết: ${post._id}, số bình luận: ${post.comments.length}`);
        for (const comment of post.comments) {
          console.log(`  Bình luận ID: ${comment._id}, Người bình luận: ${comment.name}`);
          console.log(`    Approvals:`, comment.approvals);
          console.log(`    Disapprovals:`, comment.disapprovals);
          
          const testUserId = '651a1b2c3d4e5f60718293a4'; // ID Võ Trí Hiệu
          try {
            console.log(`  Đang test downvote thử bình luận này bằng userId ${testUserId}...`);
            const res = await postService.disapproveComment(post._id, comment._id, testUserId);
            console.log("  => TEST DOWNVOTE THÀNH CÔNG!");
          } catch (err) {
            console.error("  => TEST DOWNVOTE THẤT BẠI. Lỗi là:", err);
          }
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Lỗi:", error);
    process.exit(1);
  }
}

run();
