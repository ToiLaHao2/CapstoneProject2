const mongoose = require("mongoose");
require("dotenv").config();

const connectDb = async (retryAttempts = 5) => {
    let attempts = 0;
    while (attempts < retryAttempts) {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log(`MongoDB connected: ${conn.connection.host}`);
            return; // Thành công, thoát khỏi hàm
        } catch (err) {
            attempts++;
            console.error(
                `Attempt ${attempts}: Failed to connect to MongoDB - ${err.message}`
            );
            if (attempts === retryAttempts) {
                console.error("Exceeded retry attempts. Exiting...");
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, 5000)); // Chờ 5 giây trước khi thử lại
        }
    }
};

module.exports = { connectDb };
