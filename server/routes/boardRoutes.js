const express = require("express");
const {
  validateCreateBoard,
  validateGetBoard,
} = require("../middleware/boardMiddleware");
const { CreateBoard, GetBoard } = require("../controllers/boardController");

const boardRouter = express.Router();

boardRouter.post("/createBoard", validateCreateBoard, CreateBoard);
boardRouter.post("/getBoard", validateGetBoard, GetBoard);

module.exports = boardRouter;
