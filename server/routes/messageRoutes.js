const express = require("express");
const { validateLoadMessages, validateUpdateMessage, validateDeleteMessage } = require("../middleware/messageMiddleware");
const { LoadMessages, UpdateMessage, DeleteMessage } = require("../controllers/messageController");

const messageRouter = express.Router();

messageRouter.post("/loadMessages", validateLoadMessages, LoadMessages);
messageRouter.post("/updateMessage", validateUpdateMessage, UpdateMessage);
messageRouter.post("/deleteMessage", validateDeleteMessage, DeleteMessage
);

module.exports = messageRouter;
