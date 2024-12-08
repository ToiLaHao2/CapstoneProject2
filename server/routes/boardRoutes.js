const express = require("express");
const {
    validateCreateBoard,
    validateGetBoard,
    validateUpdateBoard,
    validateDeleteBoard
} = require("../middleware/boardMiddleware");
const {
    CreateBoard,
    GetBoard,
    UpdateBoard,
    DeleteBoard
} = require("../controllers/boardController");

const boardRouter = express.Router();

boardRouter.post("/createBoard", validateCreateBoard, CreateBoard);
boardRouter.post("/getBoard", validateGetBoard, GetBoard);
boardRouter.post("/updateBoard", validateUpdateBoard, UpdateBoard);
boardRouter.post("/deleteBoard", validateDeleteBoard, DeleteBoard);

module.exports = boardRouter;
