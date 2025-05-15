const express = require("express");
const {
    validateGetUserProfile,
    validateUpdateUserProfile,
    validateGetAllUserInBoard,
    validateAddUserToBoard,
    validateRemoveUserFromBoard,
    validateGetAllUserCards,
    validateGetUserCardsIncoming,
    validateSearchUsers,
    validateSuggestUsersToAdd,
} = require("../middleware/userMiddleware");

const { upload, validateUpload } = require("../middleware/uploadMiddleware");
const {
    GetUserProfile,
    UpdateUserProfile,
    GetAllUserInBoard,
    AddUserToBoard,
    RemoveUserFromBoard,
    GetAllUserCards,
    GetUserCardsIncoming,
    SearchUsers,
    SuggestUsersToAdd,
    UploadAvatar,
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
// userRouter.post("/updateUserRole")
// userRouter.post("/assignUserToCard")
// userRouter.post("/removeUserFromCard")
userRouter.post("/getAllUserCards", validateGetAllUserCards, GetAllUserCards);
userRouter.post(
    "/getUserCardsIncoming",
    validateGetUserCardsIncoming,
    GetUserCardsIncoming
);
userRouter.post("/searchUsers", validateSearchUsers, SearchUsers);
userRouter.post(
    "/suggestUsersToAdd",
    validateSuggestUsersToAdd,
    SuggestUsersToAdd
);
userRouter.post(
    "/uploadAvatar",
    upload.single("avatar"),
    validateUpload,
    UploadAvatar
);

module.exports = userRouter;
