const express = require("express");
const {

} = require("../middleware/messageMiddleware");

const { upload, validateUpload } = require("../middleware/uploadMiddleware");
const {

} = require("../controllers/messageController");

const messageRouter = express.Router();

messageRouter.post("/getProfile", validateGetUserProfile, GetUserProfile);
messageRouter.post("/updateProfile", validateUpdateUserProfile, UpdateUserProfile);
//
messageRouter.post(
    "/getAllUserInBoard",
    validateGetAllUserInBoard,
    GetAllUserInBoard
);

module.exports = messageRouter;
