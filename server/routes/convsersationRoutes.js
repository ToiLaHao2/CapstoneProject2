// routes/conversationRoutes.js
// -----------------------------------------------------------------------------
// Router cho Conversation & Message – tương tự cardRouter bạn đưa
// -----------------------------------------------------------------------------

const express = require('express');

const {
    validateCreateConversation,
    validateGetConversation,
    validateGetConversationsByUser,
    validateAddMessageToConversation,
    validateAddParticipantToConversation,
    validateRemoveParticipantFromConversation
} = require('../middleware/conversationMiddleware');

const { upload, validateUpload } = require("../middleware/uploadMiddleware");

const {
    CreateConversation,
    AddMessageToConversation,
    GetConversation,
    AddParticipantToConversation,
    RemoveParticipantFromConversation,
    GetConversationsByUser
} = require('../controllers/conversationController');

const conversationRouter = express.Router();

// Create conversation
conversationRouter.post('/createConversation', upload.single("avatar"), validateCreateConversation, CreateConversation);

// Get a single conversation
conversationRouter.post('/getConversation', validateGetConversation, GetConversation);

// List conversations by user
conversationRouter.post('/getConversationsByUser', validateGetConversationsByUser, GetConversationsByUser);

// Add a new message to conversation
conversationRouter.post('/addMessage', validateAddMessageToConversation, AddMessageToConversation);

// Add participant
conversationRouter.post('/addParticipant', validateAddParticipantToConversation, AddParticipantToConversation);

// Remove participant
conversationRouter.post('/removeParticipant', validateRemoveParticipantFromConversation, RemoveParticipantFromConversation);

module.exports = conversationRouter;
