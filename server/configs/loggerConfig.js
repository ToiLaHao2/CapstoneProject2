const path = require("path");

module.exports = {
    level: process.env.LOG_LEVEL || "info", // Mức log (info, error, warn, debug, ...)
    format: {
        timestamp: true, // Có gắn timestamp hay không
        timestampFormat: "YYYY-MM-DD HH:mm:ss", // Định dạng timestamp
        json: false // Log ở dạng JSON hay plain text
    },
    transports: {
        console: true, // Có bật log ra console hay không
        file: {
            enabled: true, // Có ghi log ra file hay không
            path: path.join(__dirname, "../logs/app.log"), // File log tổng
            errorPath: path.join(__dirname, "../logs/error.log") // File log lỗi
        }
    }
};
