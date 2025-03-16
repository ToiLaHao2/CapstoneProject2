const express = require("express");
const {
    validateCreateBoard,
    validateGetBoard,
    validateUpdateBoard,
    validateDeleteBoard,
    validateGetBoardsByUserId,
    validateAddMember,
    validateRemoveMember,
    validateUpdateMemberRole,
    validateGetAllMembers,
    validateUpdatePrivacy,
    validateGetListsInBoard,
    validateAddListToBoard,
    validateMoveList,
} = require("../middleware/boardMiddleware");
const {
    CreateBoard,
    GetBoard,
    UpdateBoard,
    DeleteBoard,
    GetAllBoardByUserId,
    AddMemberToBoard,
    RemoveMemberFromBoard,
    UpdateMemberRole,
    GetAllMembers,
    UpdatePrivacy,
    GetListsInBoard,
    AddListToBoard,
    MoveList,
} = require("../controllers/boardController");

const boardRouter = express.Router();

boardRouter.post("/createBoard", validateCreateBoard, CreateBoard);
boardRouter.post("/getBoard", validateGetBoard, GetBoard);
boardRouter.post(
    "/getBoardsByUserId",
    validateGetBoardsByUserId,
    GetAllBoardByUserId
);
boardRouter.post("/updateBoard", validateUpdateBoard, UpdateBoard);
boardRouter.post("/deleteBoard", validateDeleteBoard, DeleteBoard);
boardRouter.post("/addMemberToBoard", validateAddMember, AddMemberToBoard);
boardRouter.post(
    "/removeMemberFromBoard",
    validateRemoveMember,
    RemoveMemberFromBoard
);
boardRouter.post(
    "/updateMemberRole",
    validateUpdateMemberRole,
    UpdateMemberRole
);
boardRouter.post("/getAllMembers", validateGetAllMembers, GetAllMembers);
boardRouter.post("/updatePrivacy", validateUpdatePrivacy, UpdatePrivacy);
boardRouter.post("/getListsInBoard", validateGetListsInBoard, GetListsInBoard);
boardRouter.post("/addListToBoard", validateAddListToBoard, AddListToBoard);
boardRouter.post("/moveList", validateMoveList, MoveList);

module.exports = boardRouter;
