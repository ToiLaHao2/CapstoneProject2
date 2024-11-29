const mongoose = require("mongoose");
const logger = require("../utils/logger");
require("dotenv").config();

const connectDb = async (retryAttempts = 5) => {
  let attempts = 0;
  while (attempts < retryAttempts) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      logger.info(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      attempts++;
      logger.error(
        `Attempt ${attempts}: Failed to connect to MongoDB - ${err.message}`
      );

      if (attempts === retryAttempts) {
        logger.error("Exceeded retry attempts. Exiting...");
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 5000)); // Chờ 5 giây trước khi thử lại
    }
  }
};

module.exports = { connectDb };
