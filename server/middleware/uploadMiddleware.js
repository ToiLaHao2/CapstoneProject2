const multer = require("multer");
const { validationRules } = require("../utils/validation/validationRules");
const { validateFields } = require("../utils/validation/validate");
const { VerifiedToken } = require("../utils/authHelpers");
const { getTokenFromHeaders } = require("../utils/jwt/getToken");
const logger = require("../utils/logger");
const { sendError } = require("../utils/response");

// Cấu hình Multer để lưu file tạm thời trên bộ nhớ
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Middleware kiểm tra request upload
 */
async function validateUpload(req, res, next) {
    try {
        const token = await getTokenFromHeaders(req);
        const checkToken = await VerifiedToken(token);
        if (!checkToken) {
            logger.error("Invalid token");
            return sendError(res, 401, "Invalid token", "");
        }

        req.body.user_id = checkToken.id;
        const uploadData = req.body;
        uploadData.file = req.file; // Thêm file vào dữ liệu kiểm tra

        const rules = validationRules["validateUpload"];
        const result = await validateFields(uploadData, rules);

        if (!result.valid) {
            logger.error(`Error validating upload data: ${result.error}`);
            return sendError(res, 400, "Invalid upload data", result.error);
        } else {
            logger.info("Successful file upload validation");
            next();
        }
    } catch (error) {
        logger.error(`Error validating upload: ${error.message}`);
        return sendError(res, 500, "Internal Server Error", error.message);
    }
}

module.exports = { upload, validateUpload };
