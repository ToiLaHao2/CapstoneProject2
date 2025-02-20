const Board = require("../models/Board");
const List = require("../models/List");
const User = require("../models/User");
const { sendError, sendSuccess } = require("../utils/response");

async function CreateList(req, res) {
    const { user_id, board_id, list_title, list_numerical_order } = req.body;
    try {
        const user = await User.findById(user_id);
        if (!user) {
            return sendError(res, 404, "User not found", "CreateList");
        }
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", "CreateList");
        }
        const list = new List({
            list_title: list_title,
            board_id: board_id,
        });
        board.board_lists.push({
            list_numerical_order: list_numerical_order,
            list_id: list._id,
        });
        await list.save();
        await board.save();
        sendSuccess(res, "Successful create list", list);
    } catch (error) {
        logger.error(error);
        sendError(res, 500, "Internal server error", error);
    }
}

async function GetList(req, res) {
    const { user_id, board_id, list_id } = req.body;
    try {
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", "GetList");
        }
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            return sendError(res, 401, "User not authorized", "GetList");
        }
        const list = await List.findById(list_id);
        if (!list) {
            return sendError(res, 404, "List not found", "GetList");
        }
        sendSuccess(res, 200, list, "GetList");
    } catch (error) {
        logger.error(error);
        sendError(res, 500, "Internal server error", error);
    }
}

async function UpdateList(req, res) {
    const { user_id, board_id, list_id, list_title } = req.body;
    try {
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", "UpdateList");
        }
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            return sendError(res, 401, "User not authorized", "UpdateList");
        }
        const isListInBoard = board.board_lists.find(
            (list) => list.list_id == list_id
        );
        if (!isListInBoard) {
            return sendError(res, 404, "List not found", "UpdateList");
        }
        const list = await List.findByIdAndUpdate(list_id, {
            list_title: list_title,
        });
        sendSuccess(res, 200, list, "UpdateList");
    } catch (error) {
        logger.error(error);
        sendError(res, 500, "Internal server error", error);
    }
}

async function DeleteList(req, res) {
    const { user_id, board_id, list_id } = req.body;
    try {
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", "DeleteList");
        }
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            return sendError(res, 401, "User not authorized", "DeleteList");
        }
        const isListInBoard = board.board_lists.find(
            (list) => list.list_id == list_id
        );
        if (!isListInBoard) {
            return sendError(res, 404, "List not found", "DeleteList");
        }
        const list = await List.findByIdAndDelete(list_id);
        board.board_lists = board.board_lists.filter(
            (list) => list.list_id != list_id
        );
        await board.save();
        sendSuccess(res, 200, list, "DeleteList");
    } catch (error) {
        logger.error(error);
        sendError(res, 500, "Internal server error", error);
    }
}

async function GetCardsInList(params) {}

module.exports = {
    CreateList,
    GetList,
    UpdateList,
    DeleteList,
    MoveList,
    GetCardsInList,
};
