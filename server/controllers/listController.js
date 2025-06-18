const Board = require("../models/Board");
const Card = require("../models/Card");
const List = require("../models/List");
const User = require("../models/User");
const { getIO, sendToSocket } = require("../sockets");
const { deleteList } = require("../utils/dbHelper");
const logger = require("../utils/logger");
const { onlineUsers } = require("../utils/onlineUser");
const { sendError, sendSuccess } = require("../utils/response");

async function CreateList(req, res) {
    const { user_id, board_id, list_title } = req.body;
    try {
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", "CreateList");
        }
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
        }
        const list = new List({
            list_title: list_title,
            board_id: board_id,
        });
        board.board_lists.push({
            list_id: list._id,
        });
        await list.save();
        await board.save();
        // notify các người dùng trong board về việc tạo list mới
        // gửi thông tin list mới cho tất cả người dùng trong board
        for (let collaborator of board.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "list:allmember:created", {
                    list: list,
                    board_id: board_id,
                })
            }
        }
        return sendSuccess(res, "Successful create list", list);
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Internal server error", error);
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
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
        }
        const list = await List.findById(list_id);
        if (!list) {
            return sendError(res, 404, "List not found", "GetList");
        }
        return sendSuccess(res, 200, list, "GetList");
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Internal server error", error);
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
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
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
        // notify các người dùng trong board về việc cập nhật list
        // gửi thông tin list đã cập nhật cho tất cả người dùng trong board
        for (let collaborator of board.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "list:allmember:updated", {
                    list: list,
                    board_id: board_id,
                })
            }
        }
        return sendSuccess(res, "Update success full", list);
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Internal server error", error);
    }
}

// delete list se xoa list va cac card trong list
// xoa list trong board
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
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
        }
        const isListInBoard = board.board_lists.find(
            (list) => list.list_id == list_id
        );
        if (!isListInBoard) {
            return sendError(res, 404, "List not found", "DeleteList");
        }
        const listDeleteResult = await deleteList(list_id);
        if (listDeleteResult.message !== "OK") {
            return sendError(res, 500, listDeleteResult.message, "DeleteList");
        }
        board.board_lists = board.board_lists.filter(
            (list) => list.list_id != list_id
        );
        // thêm người da delete list trong board
        // board.updated_by = user_id;
        // board.updated_at = new Date();
        await board.save();
        // notify các người dùng trong board về việc xóa list
        // gửi thông tin list đã xóa cho tất cả người dùng trong board
        for (let collaborator of board.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "list:allmember:deleted", {
                    list_id: list_id,
                    board_id: board_id,
                })
            }
        }
        return sendSuccess(res, "List deleted successfully");
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Internal server error", error);
    }
}

async function GetCardsInList(req, res) {
    const { user_id, board_id, list_id } = req.body;
    try {
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", "GetCardsInList");
        }
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
        }
        const isListInBoard = board.board_lists.find(
            (list) => list.list_id == list_id
        );
        if (!isListInBoard) {
            return sendError(res, 404, "List not found", "GetCardsInList");
        }
        const list = await List.findById(list_id);
        if (!list) {
            return sendError(res, 404, "List not found", "GetCardsInList");
        }
        const cards = [];
        for (const cardEntry of list.list_cards) {
            const card = await Card.findById(cardEntry.card_id);
            cards.push(card);
        }
        return sendSuccess(res, 200, cards, "GetCardsInList");
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Internal server error", error);
    }
}

module.exports = {
    CreateList,
    GetList,
    UpdateList,
    DeleteList,
    GetCardsInList,
};
