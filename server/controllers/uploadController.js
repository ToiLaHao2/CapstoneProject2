const cloudinary = require("../configs/cloudinaryConfig");
const User = require("../models/User");
const { sendError, sendSuccess } = require("../utils/response");
const logger = require("../utils/logger");

/**
 * Controller upload avatar lên Cloudinary
 */
async function UploadAvatar(req, res) {
    try {
        const { user_id } = req.body;
        const file = req.file;

        // Kiểm tra user có tồn tại không
        const user = await User.findById(user_id);
        if (!user) {
            return sendError(res, 404, "User not found", "UploadAvatar");
        }
        // kiểm tra xem đã có ảnh chưa
        if (user.user_avatar_url) {
            // Xóa ảnh cũ
            await cloudinary.uploader.destroy(user.user_avatar_url);
        }
        // Upload ảnh lên Cloudinary
        cloudinary.uploader
            .upload_stream(
                { folder: "avatars" }, // Lưu ảnh vào thư mục "avatars"
                async (error, result) => {
                    if (error) {
                        logger.error(
                            `Cloudinary upload error: ${error.message}`
                        );
                        return sendError(
                            res,
                            500,
                            "Cloudinary upload failed",
                            error.message
                        );
                    }

                    // Lưu URL ảnh vào database
                    user.user_avatar_url = result.secure_url;
                    await user.save();

                    sendSuccess(
                        res,
                        "Avatar uploaded successfully",
                        user,
                        "UploadAvatar"
                    );
                }
            )
            .end(file.buffer); // Đẩy dữ liệu ảnh lên Cloudinary
    } catch (error) {
        logger.error(`Error in UploadAvatar: ${error.message}`);
        return sendError(res, 500, "Internal server error", error.message);
    }
}

async function DownloadAvatar(req, res) {}

async function UploadFile(req, res) {}

async function DownloadFile(req, res) {}

async function DeleteFile(req, res) {}

module.exports = { UploadAvatar };
