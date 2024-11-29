require("dotenv").config();

module.exports = {
    env: process.env.NODE_ENV || "development", // Môi trường (development, production)
    port: process.env.PORT || 4000, // Port mặc định
    jwtSecret: process.env.SECRET_TOKEN_KEY || "default_secret", // JWT Secret Key
    jwtExpire: process.env.JWT_EXPIRE || "1h" // Thời gian hết hạn JWT
};
