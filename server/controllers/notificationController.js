const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require("../utils/logger.js");
const { sendError, sendSuccess } = require("../utils/response.js");

// notification
async function CreateNotification(req, res) {
    try {
        const { sender_id, receiver_ids, title, message, reference } = req.body;

        // Validate input
        if (!sender_id || !receiver_ids || !title || !message || !reference) {
            return sendError(res, 400, "All fields are required");
        }

        // Create notification
        const notification = new Notification({
            notification_sender_id: sender_id,
            notification_receiver_ids: receiver_ids.map(id => ({ receiver_id: id })),
            notification_title: title,
            notification_message: message,
            notification_reference: reference,
        });

        await notification.save();

        return sendSuccess(res, 201, "Notification created successfully", notification);
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Internal server error");
    }
}
//notification from system to user
async function CreateNotificationFromSystem(req, res) {
    try {
        const { user_id, title, message, reference } = req.body;
        // Validate input
        if (!user_id || !title || !message || !reference) {
            return sendError(res, 400, "All fields are required");
        }
        // Create notification
        const notification = new Notification({
            notification_sender_id: "System",
            notification_receiver_ids: [{ receiver_id: user_id }],
            notification_title: title,
            notification_message: message,
            notification_reference: reference,
        });
        await notification.save();
        return sendSuccess(res, 201, "Notification created successfully", notification);
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Internal server error");
    }
}

module.exports = {
    CreateNotification,
    CreateNotificationFromSystem,
};