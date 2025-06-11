// controllers/messageController.js
// -----------------------------------------------------------------------------
// Message controller: paging (cursor), update, delete
// -----------------------------------------------------------------------------

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendError, sendSuccess } = require('../utils/response');

/* ---------------------------------------------------------------------------
   1️⃣  LoadMessages – cursor‑based paging (client cuộn lên)
--------------------------------------------------------------------------- */
async function LoadMessages(req, res) {
    try {
        const {
            conversationId,
            user_id,
            beforeId,
        } = req.body;

        const pageLimit = 50;

        // 1. kiểm tra conversation & quyền
        const conv = await Conversation.findById(conversationId).lean();
        if (!conv) return sendError(res, 404, 'Conversation not found');

        if (!conv.participants.some(id => String(id) === String(user_id))) {
            return sendError(res, 401, 'User not in conversation');
        }

        // 2. build query
        const criteria = { conversationId };
        if (beforeId) criteria._id = { $lt: beforeId };

        const msgs = await Message.find(criteria)
            .sort({ _id: -1 })  // mới -> cũ
            .limit(pageLimit)
            .lean();

        msgs.reverse();       // trả về cũ -> mới cho client dễ prepend

        return sendSuccess(res, 200, 'Messages loaded', msgs);
    } catch (err) {
        logger.error('LoadMessages:', err);
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