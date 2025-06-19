// controllers/notificationController.js
// -----------------------------------------------------------------------------
// A tiny helper‑style controller: other modules can call `notify()` directly,
// plus a few REST‑style handlers for mobile / web client (list, markRead).
// -----------------------------------------------------------------------------

const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendToSocket } = require('../sockets');
const logger = require('../utils/logger');
const { onlineUsers } = require('../utils/onlineUser');
const { sendError, sendSuccess } = require('../utils/response');

/* ---------------------------------------------------------------------------
   Internal helper: create notification + emit socket event (if `io` passed)
--------------------------------------------------------------------------- */
async function notify({ senderId, receiverIds, title, message, reference }) {
    try {
        if (!Array.isArray(receiverIds) || receiverIds.length === 0) return;

        // build receivers array
        const receiversArr = receiverIds.map(id => ({ receiver_id: id, is_read: false }));


        const noti = await Notification.create({
            notification_sender_id: senderId,
            notification_receiver_ids: receiversArr,
            notification_title: title,
            notification_message: message,
            notification_reference: reference
        });

        // emit realtime event (optional)
        // lọc thông tin noti để gửi đi

        const basePayload = {
            notiId: noti._id,
            notification_title: noti.notification_title,
            notification_message: noti.notification_message,
            notification_isRead: false,
            created_at: noti.created_at
        };

        receiverIds.forEach(async uid => {
            // kiểm tra xem người dùng có đang online không
            if (onlineUsers.has(uid.toString())) {
                // lấy socket của người dùng
                const user_socket_id = onlineUsers.get(uid.toString());
                // gửi thông báo đến người dùng
                await sendToSocket(user_socket_id, 'notification:new', {
                    ...basePayload,
                    notification_receiver_id: uid,
                    isRead: false,
                });
            }
        });

        logger.info(`Notification ${noti._id} -> [${receiverIds.join(',')}]`);
        return "OK";
    } catch (err) {
        logger.error('notify():', err);
    }
}

/* ---------------------------------------------------------------------------
   REST 1️⃣  GetNotifications (paged, newest first)
--------------------------------------------------------------------------- */
async function GetNotifications(req, res) {
    try {
        const { user_id, beforeId } = req.body; // body dùng cho đồng bộ cách bạn làm

        const limit = 20;
        const user = await User.findById(user_id);
        if (!user) return sendError(res, 404, 'User not found');

        const queryConditions = {
            'notification_receiver_ids.receiver_id': user_id,
        };

        // 5. Logic phân trang (Đã sửa)
        // Thêm điều kiện _id cho phân trang "load more" nếu beforeId được cung cấp
        if (beforeId) { // Kiểm tra nếu beforeId có giá trị (không null, undefined, rỗng)
            queryConditions._id = { $lt: beforeId }; // Chỉ lấy thông báo cũ hơn beforeId
        }

        // 6. Thực thi truy vấn Mongoose
        const notis = await Notification.find(queryConditions)
            .sort({ created_at: -1 })   // Sắp xếp từ mới nhất đến cũ nhất
            .limit(limit)               // Giới hạn số lượng kết quả
            .lean();                    // Tối ưu hiệu suất

        // 7. Xử lý và Đơn giản hóa dữ liệu thông báo
        const simplifiedNotifications = notis.map((noti) => {
            const receiver = noti.notification_receiver_ids.find(
                (rec) => String(rec.receiver_id) === String(user_id)
            );

            return {
                id: noti._id,
                notification_receiver_id: user_id,
                notification_title: noti.notification_title,
                notification_message: noti.notification_message,
                is_read: receiver ? receiver.is_read : true,
                created_at: noti.created_at,
            };
        });

        // 8. Trả về phản hồi thành công
        console.log(simplifiedNotifications);
        return sendSuccess(res, 'Notifications retrieved successfully', simplifiedNotifications);
    } catch (err) {
        // 9. Xử lý lỗi
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
