const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');
const logger = require("../utils/logger.js");
const { sendError, sendSuccess } = require("../utils/response.js");

async function CreateConversation(req, res) {
    try {
        const { boardId, title, participants, avatarUrl } = req.body;
        const conversation = await Conversation.create({
            boardId,
            title,
            participants: participants.map(participant => participant._id),
            avatarUrl,
        });
        logger.info(`Conversation created successfully: ${conversation._id}`);
        sendSuccess(res, 201, 'Conversation created successfully', conversation);
    } catch (error) {
        logger.error(`Error creating conversation: ${error.message}`);
        sendError(res, 500, 'Internal Server Error');
    }
}

async function AddMessageToConversation(req, res) { }

async function GetConversation(req, res) {
    
 }

async function AddParticipantToConversation(req, res) { }

async function RemoveParticipantFromConversation(req, res) { }

async function GetConversationByUserId(req, res) {

}
