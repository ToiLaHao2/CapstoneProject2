const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|zip/;

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // giới hạn 25MB
    fileFilter: (req, file, cb) => {
        const extName = allowedTypes.test(file.originalname.toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        if (extName && mimeType) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX, XLS, XLSX, ZIP files are allowed.'));
    }
});

module.exports = { upload };
