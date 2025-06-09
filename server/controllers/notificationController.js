// controllers/notificationController.js
// -----------------------------------------------------------------------------
// A tiny helper‑style controller: other modules can call `notify()` directly,
// plus a few REST‑style handlers for mobile / web client (list, markRead).
// -----------------------------------------------------------------------------

const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendError, sendSuccess } = require('../utils/response');

/* ---------------------------------------------------------------------------
   Internal helper: create notification + emit socket event (if `io` passed)
--------------------------------------------------------------------------- */
async function notify({ senderId, receiverIds, title, message, reference, io }) {
    try {
        if (!Array.isArray(receiverIds) || receiverIds.length === 0) return;

        // build receivers array
        const receiversArr = receiverIds.map(id => ({ receiver_id: id }));

        const noti = await Notification.create({
            notification_sender_id: senderId,
            notification_receiver_ids: receiversArr,
            notification_title: title,
            notification_message: message,
            notification_reference: reference
        });

        // emit realtime event (optional)
        if (io) {
            receiverIds.forEach(uid => {
                io.to(String(uid)).emit('newNotification', noti);
            });
        }

        logger.info(`Notification ${noti._id} -> [${receiverIds.join(',')}]`);
        return noti;
    } catch (err) {
        logger.error('notify():', err);
    }
}

/* ---------------------------------------------------------------------------
   REST 1️⃣  GetNotifications (paged, newest first)
--------------------------------------------------------------------------- */
async function GetNotifications(req, res) {
    try {
        const { user_id, beforeId, limit = 20 } = req.body; // body dùng cho đồng bộ cách bạn làm

        const user = await User.findById(user_id);
        if (!user) return sendError(res, 404, 'User not found');

        const criteria = { 'notification_receiver_ids.receiver_id': user_id };
        if (beforeId) criteria._id = { $lt: beforeId };

        const notis = await Notification.find(criteria)
            .sort({ _id: -1 })
            .limit(Number(limit))
            .lean();

        notis.reverse();
        return sendSuccess(res, 200, 'Notifications', notis);
    } catch (err) {
        logger.error('GetNotifications:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   REST 2️⃣  MarkNotificationRead (single)
--------------------------------------------------------------------------- */
async function MarkNotificationRead(req, res) {
    try {
        const { notificationId, user_id } = req.body;

        const result = await Notification.updateOne(
            { _id: notificationId, 'notification_receiver_ids.receiver_id': user_id },
            { $set: { 'notification_receiver_ids.$.is_read': true } }
        );

        if (result.matchedCount === 0) return sendError(res, 404, 'Notification not found');
        return sendSuccess(res, 200, 'Marked as read');
    } catch (err) {
        logger.error('MarkNotificationRead:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   REST 3️⃣  MarkAllRead
--------------------------------------------------------------------------- */
async function MarkAllRead(req, res) {
    try {
        const { user_id } = req.body;
        await Notification.updateMany(
            { 'notification_receiver_ids.receiver_id': user_id },
            { $set: { 'notification_receiver_ids.$[elem].is_read': true } },
            { arrayFilters: [{ 'elem.receiver_id': user_id, 'elem.is_read': false }] }
        );
s
        return sendSuccess(res, 200, 'All notifications marked as read');
    } catch (err) {
        logger.error('MarkAllRead:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   EXPORTS (notify dùng cho controller khác – các REST dùng cho route)
--------------------------------------------------------------------------- */
module.exports = {
    notify,
    GetNotifications,
    MarkNotificationRead,
    MarkAllRead
};
