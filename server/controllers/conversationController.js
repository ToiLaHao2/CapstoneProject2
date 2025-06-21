// controllers/conversationController.js
// -----------------------------------------------------------------------------
// Controller (phiên bản PascalCase & module.exports) cho Conversation / Message
// -----------------------------------------------------------------------------

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Board = require('../models/Board');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendError, sendSuccess } = require('../utils/response');
const cloudinary = require("../configs/cloudinaryConfig");
const { notify } = require("../controllers/notificationController");
const { onlineUsers } = require('../utils/onlineUser');
const { getIO, sendToSocket } = require('../sockets/index');

/* ---------------------------------------------------------------------------
   Helpers
--------------------------------------------------------------------------- */
async function isUserBoardMember(board, userId) {
    if (String(board.created_by) === String(userId)) return true;
    return board.board_collaborators.some(c => String(c.board_collaborator_id) === String(userId));
}

function uniqObjectIds(arr = []) {
    const seen = new Set();
    return arr.filter(id => {
        const key = String(id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/* ---------------------------------------------------------------------------
   1️⃣  CreateConversation
--------------------------------------------------------------------------- */
async function CreateConversation(req, res) {
    try {
        const { boardId, title, participants, user_id } = req.body;
        const file = req.file;

        const [user, board] = await Promise.all([
            User.findById(user_id),
            Board.findById(boardId)
        ]);

        if (!user) return sendError(res, 404, 'User not found');
        if (!board) return sendError(res, 404, 'Board not found');

        if (!(await isUserBoardMember(board, user_id))) {
            return sendError(res, 401, 'User not authorized');
        }

        // kiểm tra xem conversation của board có tồn tại hay không
        const isConversationExist = await Conversation.findOne({ board_id: boardId });
        if (isConversationExist) {
            return sendSuccess(res, "Conversation exists", isConversationExist._id)
        }

        const participantIds = uniqObjectIds([
            ...participants.map(p => p._id || p),
            user_id
        ]);

        // nếu có file thì đẩy lên cloudinary không thì lưu null
        let avatarUrl = null;
        if (file) {
            cloudinary.uploader.upload_stream(
                { folder: "conversations" },
                (error, result) => {
                    if (error) {
                        logger.error('Cloudinary upload error:', error);
                        return sendError(res, 500, 'Cloudinary upload error');
                    }
                    avatarUrl = result?.secure_url || null;
                }
            )
        }
        const conversation = await Conversation.create({
            boardId,
            title,
            participants: participantIds,
            owner: board.created_by,
            avatarUrl
        });
        // gửi thông báo đến tất cả người dùng trong cuộc trò chuyện
        const receiverIds = participantIds.filter(id => String(id) !== String(user_id));
        const CreateConversationNotification = await notify({
            senderId: user_id,
            receiverIds,
            title: 'New Conversation Created',
            message: `You have been added to a new conversation: ${title}`,
            reference: conversation._id,
        });
        if (CreateConversationNotification !== "OK") {
            logger.error('CreateConversation: Failed to send notification');
        }

        // gửi thông tin conversation đến tất cả người dùng trong cuộc trò chuyện qua socket.io
        for (const participantId of receiverIds) {
            if (onlineUsers.has(participantId)) {
                const socketId = onlineUsers.get(participantId);
                await sendToSocket(socketId, "conversation:allmember:created");
            }
        }
        logger.info(`Conversation created ${conversation._id}`);
        return sendSuccess(res, 'Conversation created', conversation);
    } catch (err) {
        logger.error('CreateConversation:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   2️⃣  AddMessageToConversation
--------------------------------------------------------------------------- */
async function AddMessageToConversation(req, res) {
    try {
        const { conversationId, content, user_id } = req.body;

        const [user, conv] = await Promise.all([
            User.findById(user_id),
            Conversation.findById(conversationId)
        ]);

        if (!user) return sendError(res, 404, 'User not found');
        if (!conv) return sendError(res, 404, 'Conversation not found');

        if (!conv.participants.some(id => String(id) === String(user_id))) {
            return sendError(res, 401, 'User not in conversation');
        }

        const msg = await Message.create({
            conversationId,
            senderId: user_id,
            content
        });

        conv.lastMessageId = msg._id;
        conv.lastMessageAt = msg.createdAt;
        await conv.save();

        // gửi thông tin message đến tất cả người dùng trong cuộc trò chuyện qua socket.io
        const receiverIds = conv.participants.filter(id => String(id) !== String(user_id));
        for (const receiverId of receiverIds) {
            if (onlineUsers.has(receiverId.toString())) {
                const socketId = onlineUsers.get(receiverId.toString());
                await sendToSocket(socketId, "conversation:allmember:addmessage", msg)
            }
        }
        // gửi thông báo đến tất cả người dùng trong cuộc trò chuyện có tin nhắn mới
        const addMessageNotification = await notify({
            senderId: user_id,
            receiverIds,
            title: 'New Message',
            message: `You have a new message in conversation: ${conv.title || 'No title'}`,
            reference: conversationId,
        });
        if (addMessageNotification !== "OK") {
            logger.error('AddMessageToConversation: Failed to send notification');
        }

        logger.info(`Message ${msg._id} -> Conversation ${conversationId}`);
        return sendSuccess(res, 'Message created', msg);
    } catch (err) {
        logger.error('AddMessageToConversation:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   3️⃣  GetConversation
--------------------------------------------------------------------------- */
async function GetConversation(req, res) {
    try {
        const { conversationId, user_id } = req.body;

        const conv = await Conversation.findById(conversationId)
            .populate('participants', '_id user_full_name user_avatar_url user_email')
            .populate('owner', '_id user_full_name user_avatar_url user_email')
            .populate('lastMessageId');

        if (!conv) return sendError(res, 404, 'Conversation not found');

        const allowed = conv.participants.some(p => String(p._id || p) === String(user_id));
        if (!allowed) return sendError(res, 401, 'User not authorized');

        return sendSuccess(res, 'Conversation fetched', conv);
    } catch (err) {
        logger.error('GetConversation:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   4️⃣  AddParticipantToConversation
--------------------------------------------------------------------------- */
async function AddParticipantToConversation(req, res) {
    try {
        const { conversationId, user_add_id, user_id } = req.body;

        const [conv, board] = await Promise.all([
            Conversation.findById(conversationId),
            Conversation.findById(conversationId).then(c => Board.findById(c?.boardId))
        ]);

        if (!conv) return sendError(res, 404, 'Conversation not found');
        if (!board) return sendError(res, 404, 'Board not found');

        const user_add = await User.findById(user_add_id);

        const participantIds = conv.participants.map(p => String(p._id || p));

        if (!conv.participants.some(id => String(id) === String(user_id))) {
            return sendError(res, 401, 'Requester not in conversation');
        }

        if (!(await isUserBoardMember(board, user_add_id))) {
            return sendError(res, 401, 'User to add not in board');
        }

        if (conv.participants.some(id => String(id) === String(user_add_id))) {
            return sendError(res, 409, 'User already in conversation');
        }

        conv.participants.push(user_add_id);
        await conv.save();
        // gửi thông tin về người dùng mới được thêm vào cuộc trò chuyện
        for (const participantId of participantIds) {
            if (onlineUsers.has(participantId.toString())) {
                const socketId = onlineUsers.get(participantId.toString());
                await sendToSocket(socketId, "conversation:allmember:addmember",
                    {
                        _id: user_add._id,
                        user_full_name: user_add.user_full_name,
                        user_avatar_url: user_add.user_avatar_url,
                        user_email: user_add.user_email
                    }
                )
            }
        }

        logger.info(`AddParticipant ${user_add_id} -> Conversation ${conversationId}`);
        return sendSuccess(res, 200, 'Participant added');
    } catch (err) {
        logger.error('AddParticipantToConversation:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   5️⃣  RemoveParticipantFromConversation
--------------------------------------------------------------------------- */
async function RemoveParticipantFromConversation(req, res) {
    try {
        const { conversationId, user_remove_id, user_id } = req.body;

        const conv = await Conversation.findById(conversationId);
        if (!conv) return sendError(res, 404, 'Conversation not found');

        if (String(conv.owner) !== String(user_id)) {
            return sendError(res, 401, 'Only owner can remove');
        }

        const participantIds = conv.participants.map(p => String(p._id || p));

        if (!conv.participants.some(id => String(id) === String(user_remove_id))) {
            return sendError(res, 404, 'User not in conversation');
        }

        conv.participants.pull(user_remove_id);
        await conv.save();

        // gửi thông tin về người dùng bị xóa khỏi cuộc trò chuyện
        for (const participantId of participantIds) {
            if (onlineUsers.has(participantId)) {
                const socketId = onlineUsers.get(participantId.toString());
                await sendToSocket(socketId, "conversation:allmember:removemember",
                    user_remove_id);
            }
        }

        logger.info(`RemoveParticipant ${user_remove_id} <- Conversation ${conversationId}`);
        return sendSuccess(res, 200, 'Participant removed');
    } catch (err) {
        logger.error('RemoveParticipantFromConversation:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   6️⃣  GetConversationsByUser
--------------------------------------------------------------------------- */
async function GetConversationsByUser(req, res) {
    try {
        const { user_id } = req.body;
        const user = await User.findById(user_id);
        if (!user) return sendError(res, 404, 'User not found');

        const convs = await Conversation.find({ participants: user_id })
            .populate('participants', '_id user_full_name user_avatar_url user_email')
            .populate('owner', '_id user_full_name user_avatar_url user_email')
            .sort({ lastMessageAt: -1 })
            .lean();

        // thêm convs mà user là owner
        const ownerConvs = await Conversation.find({ owner: user_id })
            .populate('participants', '_id user_full_name user_avatar_url user_email')
            .populate('owner', '_id user_full_name user_avatar_url user_email')
            .sort({ lastMessageAt: -1 })
            .lean();

        convs.push(...ownerConvs);

        logger.info("Get conversations of user", user_id);

        return sendSuccess(res, 'Conversations fetched', convs);
    } catch (err) {
        logger.error('GetConversationsByUser:', err);
        return sendError(res, 500, 'Internal Server Error');
    }
}

/* ---------------------------------------------------------------------------
   EXPORTS (kiểu object cuối file)
--------------------------------------------------------------------------- */
module.exports = {
    CreateConversation,
    AddMessageToConversation,
    GetConversation,
    AddParticipantToConversation,
    RemoveParticipantFromConversation,
    GetConversationsByUser
};
