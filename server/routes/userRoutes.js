const express = require("express");
const {
    validateGetUserProfile,
    validateUpdateUserProfile,
    validateGetAllUserInBoard,
    validateAddUserToBoard,
    validateRemoveUserFromBoard,
} = require("../middleware/userMiddleware");
const {
    GetUserProfile,
    UpdateUserProfile,
    GetAllUserInBoard,
    AddUserToBoard,
    RemoveUserFromBoard,
} = require("../controllers/userController");

const userRouter = express.Router();

userRouter.post("/getProfile", validateGetUserProfile, GetUserProfile);
userRouter.post("/updateProfile", validateUpdateUserProfile, UpdateUserProfile);
//
userRouter.post(
    "/getAllUserInBoard",
    validateGetAllUserInBoard,
    GetAllUserInBoard
);
userRouter.post("/addUserToBoard", validateAddUserToBoard, AddUserToBoard);
userRouter.post(
    "/removeUserFromBoard",
    validateRemoveUserFromBoard,
    RemoveUserFromBoard
);

module.exports = userRouter;
