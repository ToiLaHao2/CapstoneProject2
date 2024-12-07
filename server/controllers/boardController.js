const Board = require("../models/Board");
const User = require("../models/User");
const logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/response");

async function CreateBoard(req, res) {
  const boardReqCreate = req.body;
  const user = await User.findById(boardReqCreate.user_id);
  if (!user) {
    sendError(res, 401, "Unauthorized", { details: "User is not registed" });
  }
  try {
    let board = new Board({
      board_title: boardReqCreate.board_title,
      board_description: boardReqCreate.board_description,
      board_is_public: boardReqCreate.board_is_public,
      board_lists: boardReqCreate.board_lists,
      board_collaborators: boardReqCreate.board_collaborators,
      created_by: boardReqCreate.user_id,
      created_at: Date.now,
    });

    const newBoard = await board.save();
    user.boards.push({ board_id: newBoard._id, role: "ADMIN" });
    await user.save();

    sendSuccess(res, "Create board success", newBoard._id);
  } catch (error) {
    logger.error(`Error with create board : ${error}`);
    sendError(res, 500, `Error while create board`, { details: error });
  }
}

async function GetBoard(req, res) {
  const boardReqGet = req.body;
  const user = await User.findById(boardReqGet.user_id);
  if (!user) {
    sendError(res, 401, "Unauthorized", { details: "User is not registed" });
  }

  const existBoard = user.boards.some(
    (board) => board.board_id === boardReqGet.board_id
  );

  if (!existBoard) {
    sendError(res, 404, "Undefined board", {
      details: "User is not a member or admin of board",
    });
  }

  const board = await Board.findById(boardReqGet.board_id);
  if (!board) {
    sendError(res, 404, "Board not found", { details: "Board is not existed" });
  }

  const userExist = board.board_collaborators.some(
    (user) => user.board_collaborator_id === boardReqGet.user_id
  );

  if (!userExist) {
    sendError(res, 404, "Undefined user", {
      details: "User is not a member or admin of board",
    });
  }

  sendSuccess(res, "Successfull get board data", board);
}

module.exports = { CreateBoard, GetBoard };
