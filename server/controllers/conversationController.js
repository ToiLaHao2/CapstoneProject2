const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Board = require('../models/Board');
const Message = require('../models/Message');
const logger = require("../utils/logger.js");
const { sendError, sendSuccess } = require("../utils/response.js");

async function CreateConversation(req, res) {
    try {
        const { boardId, title, participants, avatarUrl, user_id } = req.body;
        // kiểm tra user có tồn tại không
        const user = await User.findById(user_id);
        if (!user) {
            logger.error(`User with ID ${user_id} not found`);
            return sendError(res, 404, 'User not found');
        }
        // kiểm tra board có tồn tại không
        const board = await Board.findById(boardId);
        if (!board) {
            logger.error(`Board with ID ${boardId} not found`);
            return sendError(res, 404, 'Board not found');
        }
        // kiểm tra user có phải thuộc board không hay user có là creator khong
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
        }

        const conversation = await Conversation.create({
            conversation_board_id: boardId,
            conversation_title: title,
            conversation_participants: participants.map(participant => participant._id),
            conversation_avatar_url: avatarUrl,
            conversation_owner: board.created_by,
        });
        // thêm creator vào participants
        conversation.conversation_participants.push(board.created_by);
        // lưu lại conversation
        await conversation.save();
        logger.info(`Conversation created successfully: ${conversation._id}`);
        sendSuccess(res, 201, 'Conversation created successfully', conversation);
    } catch (error) {
        logger.error(`Error creating conversation: ${error.message}`);
        sendError(res, 500, 'Internal Server Error');
    }
}

async function AddMessageToConversation(req, res) {
    try {
        const { conversation_id, message_content, user_id } = req.body;
        // kiểm tra user có tồn tại không
        const user = await User.findById(user_id);
        if (!user) {
            logger.error(`User with ID ${user_id} not found`);
            return sendError(res, 404, 'User not found');
        }
        // kiểm tra conversation có tồn tại không
        const conversation = await Conversation.findById(conversation_id);
        if (!conversation) {
            logger.error(`Conversation with ID ${conversation_id} not found`);
            return sendError(res, 404, 'Conversation not found');
        }
        // kiểm tra user có phải là participant của conversation không
        const isUserExist = conversation.conversation_participants.find(
            (participant) => String(participant._id) === String(user_id)
        );
        if (!isUserExist) {
            return sendError(res, 401, "User not authorized", "AddMessage");
        }
        // tạo message mới
        const message = await Message.create({
            message_sender_id: user_id,
            message_content: message_content,
            message_conversation_id: conversation_id,
        });
        // thêm message vào conversation
        conversation.conversation_messages.push(message._id);
        await conversation.save();
        logger.info(`Message added to conversation successfully: ${conversation_id}`);
        // socket.io ở đây để gửi message đến tất cả các participant của conversation đang online và gửi thông báo
        sendSuccess(res, 201, 'Message added to conversation successfully', message);
    } catch (error) {
        logger.error(`Error adding message to conversation: ${error.message}`);
        return sendError(res, 500, 'Internal Server Error');
    }
}

async function GetConversation(req, res) {
    try {
        const { conversation_id, user_id } = req.body;
        // kiểm tra user có tồn tại không
        const user = await User.findById(user_id);
        if (!user) {
            logger.error(`User with ID ${user_id} not found`);
            return sendError(res, 404, 'User not found');
        }
        // kiểm ta xem conversation có tồn tại không
        const conversation = await Conversation.findById(conversation_id).populate;
        if (!conversation) {
            logger.error(`Conversation with ID ${conversation_id} not found`);
            return sendError(res, 404, 'Conversation not found');
        }
        // kiểm tra user có phải là participant của conversation không
        const isParticipant = conversation.conversation_participants.some(
            (participant) => String(participant._id) === String(user_id)
        );
        if (!isParticipant) {
            return sendError(res, 401, "User not authorized", "GetConversation");
        }
        // nếu có thì trả về conversation cùng với lấy thông tin của các messages và thông tin conversation
        // tạo 1 biến response để chứa thông tin conversation và messages và thông tin của các participants
        const messages = await Message.find({ message_conversation_id: conversation_id })
            .select('message_sender_id message_content created_at').sort({ created_at: 1 })
        const participants = await User.find({
            _id: { $in: conversation.conversation_participants }
        }).select('username avatar_url email created_at');
        const response = {
            conversation: {
                id: conversation._id,
                title: conversation.conversation_title,
                avatarUrl: conversation.conversation_avatar_url,
            },
            messages: messages.map(message => ({
                id: message._id,
                senderId: message.message_sender_id,
                content: message.message_content,
                createdAt: message.created_at,
            })),
            participants: participants.map(participant => ({
                id: participant._id,
                username: participant.username,
                avatarUrl: participant.avatar_url,
                email: participant.email,
            }))
        };
        logger.info(`Conversation fetched successfully: ${conversation_id}`);
        return sendSuccess(res, 200, 'Conversation fetched successfully', response);
    } catch (error) {
        logger.error(`Error fetching conversation: ${error.message}`);
        sendError(res, 500, 'Internal Server Error');
    }
}

async function AddParticipantToConversation(req, res) {
    try {
        const { conversation_id, user_add_id, user_id } = req.body;
        // kiểm tra 2 user có tồn tại không
        const user = await User.findById(user_id);
        if (!user) {
            logger.error(`User with ID ${user_id} not found`);
            return sendError(res, 404, 'User not found');
        }
        const userAdd = await User.findById(user_add_id);
        if (!userAdd) {
            logger.error(`User with ID ${user_add_id} not found`);
            return sendError(res, 404, 'User to add not found');
        }
        // kiểm tra conversation có tồn tại không
        const conversation = await Conversation.findById(conversation_id);
        if (!conversation) {
            logger.error(`Conversation with ID ${conversation_id} not found`);
            return sendError(res, 404, 'Conversation not found');
        }
        // kiểm tra user_id request có phải thuôc conversation không
        const isUserInConversation = conversation.conversation_participants.some(
            (participant) => String(participant._id) === String(user_id)
        );
        if (!isUserInConversation) {
            return sendError(res, 401, "User not authorized", "AddParticipant");
        }
        // kiểm tra user_add_id có phải là participant của conversation không
        const isParticipant = conversation.conversation_participants.some(
            (participant) => String(participant._id) === String(user_id)
        );
        if (isParticipant) {
            return sendError(res, 401, "User is in conversation", "AddParticipant");
        }
        // kiểm tra 2 user có cùng board không
        const board = await Board.findById(conversation.conversation_board_id);
        // kiểm tra user_add_id có phải là collaborator của board không
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user._id
        );
        if (!isUserExist) {
            if (board.created_by !== user._id) {
                return sendError(res, 401, "User not authorized", "AddParticipant");
            }
        }
        // kiểm tra user có phải là colaborator của board không
        const isUserCollaborator = board.board_collaborators.some(
            (collaborator) => collaborator.board_collaborator_id === userAdd._id
        );
        if (!isUserCollaborator && board.created_by !== userAdd._id) {
            return sendError(res, 401, "User not authorized to add participant", "AddParticipant");
        }
        // nếu có thì thêm user_add_id vào conversation
        conversation.conversation_participants.push(userAdd._id);
        await conversation.save();
        logger.info(`User ${userAdd._id} added to conversation ${conversation_id}`);
        return sendSuccess(res, 200, 'User added to conversation successfully', {
            conversationId: conversation._id,
            participantId: userAdd._id
        });
    } catch (error) {
        logger.error(`Error adding participant to conversation: ${error.message}`);
        return sendError(res, 500, 'Internal Server Error');
    }
}

async function RemoveParticipantFromConversation(req, res) {
    try {
        const { conversation_id, user_remove_id, user_id } = req.body;
        // kiểm tra 2 user có tồn tại không
        const user = await User.findById(user_id);
        if (!user) {
            logger.error(`User with ID ${user_id} not found`);
            return sendError(res, 404, 'User not found');
        }
        const userRemove = await User.findById(user_remove_id);
        if (!userRemove) {
            logger.error(`User with ID ${user_remove_id} not found`);
            return sendError(res, 404, 'User to remove not found');
        }
        // kiểm tra conversation có tồn tại không
        const conversation = await Conversation.findById(conversation_id);
        if (!conversation) {
            logger.error(`Conversation with ID ${conversation_id} not found`);
            return sendError(res, 404, 'Conversation not found');
        }
        // kiểm tra user_id request có phải conversation_owner không
        if (String(conversation.conversation_owner) !== String(user_id)) {
            return sendError(res, 401, "User not authorized", "RemoveParticipant");
        }
        // kiểm tra user_remove_id có phải là participant của conversation không
        const isUserParticipant = conversation.conversation_participants.some(
            (participant) => String(participant._id) === String(user_remove_id)
        );
        if (!isUserParticipant) {
            return sendError(res, 404, "User not found in conversation", "RemoveParticipant");
        }
        // nếu có thì xóa user_remove_id khỏi conversation
        conversation.conversation_participants.pull(user_remove_id);
        await conversation.save();
        logger.info(`User ${user_remove_id} removed from conversation ${conversation_id}`);
        return sendSuccess(res, 200, 'User removed from conversation successfully', {
            conversationId: conversation._id,
            participantId: user_remove_id
        });
    } catch (error) {
        logger.error(`Error removing participant from conversation: ${error.message}`);
        return sendError(res, 500, 'Internal Server Error');
    }
}

async function GetConversationByUserId(req, res) {
    try {
        const { user_id } = req.body;
        // kiểm tra user có tồn tại không
        const user = await User.findById(user_id);
        if (!user) {
            logger.error(`User with ID ${user_id} not found`);
            return sendError(res, 404, 'User not found');
        }
        // tìm tất cả conversations mà user là participant hoặc conversation_owner
        const conversations = await Conversation.find({
            $or: [
                { conversation_participants: user_id },
                { conversation_owner: user_id }
            ]
        }).populate('conversation_participants', 'user_full_name user_avatar_url user_email')
            .populate('conversation_owner', 'user_full_name user_avatar_url user_email')
            .sort({ updated_at: -1 }); // sort by updated_at in descending order
        if (conversations.length === 0) {
            logger.info(`No conversations found for user ID ${user_id}`);
            return sendSuccess(res, 200, 'No conversations found', []);
        }
        // map lại dữ liệu để trả về
        const mappedConversations = conversations.map((conversation) => {
            return {
                id: conversation._id,
                title: conversation.conversation_title,
                avatarUrl: conversation.conversation_avatar_url,
                participants: conversation.conversation_participants.map(participant => ({
                    id: participant._id,
                    username: participant.user_full_name,
                    avatarUrl: participant.user_avatar_url,
                    email: participant.user_email
                })),
                owner: {
                    id: conversation.conversation_owner._id,
                    username: conversation.conversation_owner.user_full_name,
                    avatarUrl: conversation.conversation_owner.user_avatar_url,
                    email: conversation.conversation_owner.user_email
                },
                updatedAt: conversation.updated_at
            };
        }
        );
        logger.info(`Conversations fetched successfully for user ID ${user_id}`);
        return sendSuccess(res, 200, 'Conversations fetched successfully', mappedConversations);
    } catch (error) {
        logger.error(`Error fetching conversations by user ID: ${error.message}`);
        return sendError(res, 500, 'Internal Server Error');
    }
}
