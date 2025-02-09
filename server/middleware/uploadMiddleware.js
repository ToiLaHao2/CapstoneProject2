const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinaryConfig");

// Cấu hình storage để lưu trữ ảnh trên Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads", // Thư mục trên Cloudinary
        format: async (req, file) => "png", // Định dạng file mặc định là PNG
        public_id: (req, file) => file.originalname // Giữ nguyên tên file gốc
    }
});

// Middleware upload
const upload = multer({ storage });

module.exports = upload;
