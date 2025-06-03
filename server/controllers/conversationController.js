const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');
const logger = require("../utils/logger.js");
const { sendError, sendSuccess } = require("../utils/response.js");

async function CreateConversation(req, res) {
    try {
        const { boardId, title, participants, avatarUrl } = req.body;
    } catch (error) {
        logger.error(`Error creating conversation: ${error.message}`);
        sendError(res, 500, 'Internal Server Error');
        
    }
}

async function AddMessageToConversation(req, res) { }

async function GetConversationHistory(req, res) { }

async function AddParticipantToConversation(req, res) { }

async function RemoveParticipantFromConversation(req, res) { }
