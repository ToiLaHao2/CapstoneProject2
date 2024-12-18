const express = require("express");
const {
    validateCreateBoard,
    validateGetBoard,
    validateUpdateBoard,
    validateDeleteBoard,
    validateGetBoardsByUserId
} = require("../middleware/boardMiddleware");
const {
    CreateBoard,
    GetBoard,
    UpdateBoard,
    DeleteBoard,
    GetAllBoardByUserId
} = require("../controllers/boardController");

const boardRouter = express.Router();

boardRouter.post("/createBoard", validateCreateBoard, CreateBoard);
boardRouter.post("/getBoard", validateGetBoard, GetBoard);
boardRouter.post("/getBoardsByUserId", validateGetBoardsByUserId, GetAllBoardByUserId);
boardRouter.post("/updateBoard", validateUpdateBoard, UpdateBoard);
boardRouter.post("/deleteBoard", validateDeleteBoard, DeleteBoard);

module.exports = boardRouter;
