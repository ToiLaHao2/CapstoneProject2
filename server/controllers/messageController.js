// controllers/messageController.js
// -----------------------------------------------------------------------------
// Message controller: paging (cursor), update, delete
// -----------------------------------------------------------------------------

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendError, sendSuccess } = require('../utils/response');
const { getIO } = require('../sockets/index');
const { onlineUsers } = require('../utils/onlineUser');

/* ---------------------------------------------------------------------------
   1️⃣  LoadMessages – cursor‑based paging (client cuộn lên)
--------------------------------------------------------------------------- */
// controllers/conversationController.js

async function LoadMessages(req, res) {
    try {
        const {
            conversationId,
            user_id,
            beforeId,
        } = req.body;

        const pageLimit = 50; // Số lượng tin nhắn tối đa mỗi lần tải

        // 1. Kiểm tra tồn tại Conversation và quyền truy cập của người dùng
        const conv = await Conversation.findById(conversationId).lean();
        if (!conv) {
            logger.warn(`LoadMessages: Conversation with ID ${conversationId} not found.`);
            return sendError(res, 404, 'Conversation not found');
        }

        // Đảm bảo người dùng hiện tại là thành viên của cuộc trò chuyện
        if (!conv.participants.some(id => String(id) === String(user_id))) {
            logger.warn(`LoadMessages: User ${user_id} not authorized for conversation ${conversationId}.`);
            return sendError(res, 401, 'User not in conversation');
        }

        // 2. Xây dựng truy vấn để lấy tin nhắn
        const criteria = { conversationId };
        if (beforeId) {
            // Nếu có beforeId, lấy các tin nhắn cũ hơn tin nhắn này
            criteria._id = { $lt: beforeId };
            logger.info(`LoadMessages: Fetching messages for conversation ${conversationId} before ID ${beforeId}.`);
        } else {
            logger.info(`LoadMessages: Fetching initial messages for conversation ${conversationId}.`);
        }

        // 3. Thực hiện truy vấn tin nhắn và POPULATE thông tin người gửi
        // Dòng này rất quan trọng để đảm bảo frontend nhận được đối tượng 'sender' đầy đủ.
        const msgs = await Message.find(criteria)
            .sort({ _id: -1 }) // Sắp xếp từ mới nhất đến cũ nhất (để dễ dàng lấy `beforeId` cho lần tải tiếp theo)
            .limit(pageLimit)
            .populate('senderId', '_id user_full_name user_avatar_url user_email') // <-- Đảm bảo lấy thông tin sender
            .lean(); // Sử dụng .lean() để trả về plain JavaScript objects, tối ưu hiệu suất

        // 4. Đảo ngược thứ tự mảng để tin nhắn cũ nhất nằm ở đầu
        // Điều này giúp frontend dễ dàng thêm (prepend) các tin nhắn cũ hơn vào đầu danh sách hiện có.
        msgs.reverse();

        logger.info(`Successfully loaded ${msgs.length} messages for conversation ${conversationId}.`);

        // 5. Gửi tin nhắn đã được populate về frontend
        return sendSuccess(res, 'Messages loaded', msgs);
    } catch (err) {
        logger.error('LoadMessages: Error fetching messages:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   2️⃣  UpdateMessage – chỉ cho sender
--------------------------------------------------------------------------- */
async function UpdateMessage(req, res) {
    try {
        const { messageId, content, user_id } = req.body;

        const msg = await Message.findById(messageId);
        if (!msg) return sendError(res, 404, 'Message not found');

        if (String(msg.senderId) !== String(user_id)) {
            return sendError(res, 401, 'Only sender can edit');
        }

        msg.content = content;
        await msg.save();

        return sendSuccess(res, 200, 'Message updated', msg);
    } catch (err) {
        logger.error('UpdateMessage:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   3️⃣  DeleteMessage – sender hoặc owner conversation
--------------------------------------------------------------------------- */
async function DeleteMessage(req, res) {
    try {
        const { messageId, user_id } = req.body;

        const msg = await Message.findById(messageId);
        if (!msg) return sendError(res, 404, 'Message not found');

        const conv = await Conversation.findById(msg.conversationId);
        if (!conv) return sendError(res, 404, 'Conversation not found');

        const isOwner = String(conv.owner) === String(user_id);
        const isSender = String(msg.senderId) === String(user_id);
        if (!isOwner && !isSender) {
            return sendError(res, 401, 'Not authorized to delete');
        }

        await msg.remove();
        // gửi thông tin message đã xóa đến tất cả người dùng trong conversation
        const participantIds = conv.participants.map(id => String(id));
        const io = getIO();
        for (const participantId of participantIds) {
            if (onlineUsers.has(participantId)) {
                const userSocketId = onlineUsers.get(participantId);
                io.to(userSocketId).emit('message:deleted', { messageId });
            }
        }

        return sendSuccess(res, 200, 'Message deleted');
    } catch (err) {
        logger.error('DeleteMessage:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   EXPORTS
--------------------------------------------------------------------------- */
module.exports = {
    LoadMessages,
    UpdateMessage,
    DeleteMessage
};
/* ---------------------------------------------------------------------------
   MESSAGE CONTROLLER
   - LoadMessages: cursor-based paging
   - UpdateMessage: chỉ cho sender
   - DeleteMessage: sender hoặc owner conversation
*/