const Card = require("../models/Card");
const List = require("../models/List.js");
const Board = require("../models/Board.js");
const logger = require("../utils/logger.js");
const { sendError, sendSuccess } = require("../utils/response.js");

async function CreateCard(req, res) {
    try {
        const { user_id, board_id, list_id, card_title } = req.body;
        // check if user is a member of the board
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found");
        }
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
        }
        // check if list exists
        const list = await List.findById(list_id);
        if (!list) {
            return sendError(res, 404, "List not found");
        }
        // check if list in board
        if (String(list.board_id) !== board_id) {
            return sendError(res, 403, "List does not belong to the board");
        }
        // create new card
        const newCard = new Card({
            card_title: card_title,
            card_description: "",
            created_by: user_id,
        });
        const card = await newCard.save();
        // add card to list
        list.list_cards.push({
            card_numerical_order: list.list_cards.length - 1,
            card_id: card._id,
        });
        await list.save();
        return sendSuccess(res, 201, card);
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

async function GetCard(req, res) {
    try {
        const { user_id, board_id, list_id, card_id } = req.body;
        // check if user is a member of the board
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found");
        }
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
        }
        // check if list exists
        const list = await List.findById(list_id);
        if (!list) {
            return sendError(res, 404, "List not found");
        }
        // check if list in board
        if (String(list.board_id) !== board_id) {
            return sendError(res, 403, "List does not belong to the board");
        }
        // check if card exists
        const card = await Card.findById(card_id);
        if (!card) {
            return sendError(res, 404, "Card not found");
        }
        // check if card in list
        const cardInList = list.list_cards.find(
            (card) => String(card.card_id) === card_id
        );
        if (!cardInList) {
            return sendError(res, 403, "Card does not belong to the list");
        }
        return sendSuccess(res, 200, card);
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

async function UpdateCard(req, res) {
    try {
        const { user_id, board_id, list_id, card_id, card_update_details } =
            req.body;
        // check if user is a member of the board
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found");
        }
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
        }
        // check if list exists
        const list = await List.findById(list_id);
        if (!list) {
            return sendError(res, 404, "List not found");
        }
        // check if list in board
        if (String(list.board_id) !== board_id) {
            return sendError(res, 403, "List does not belong to the board");
        }
        // check if card exists
        const card = await Card.findById(card_id);
        if (!card) {
            return sendError(res, 404, "Card not found");
        }
        // check if card in list
        const cardInList = list.list_cards.find(
            (card) => String(card.card_id) === card_id
        );
        if (!cardInList) {
            return sendError(res, 403, "Card does not belong to the list");
        }
        // update card
        const allowedFields = [
            "card_title",
            "card_description",
            "card_due_date",
            "card_completed",
        ];
        let hasUpdated = false;

        for (const key in card_update_details) {
            if (
                allowedFields.includes(key) &&
                card[key] !== card_update_details[key]
            ) {
                card[key] = card_update_details[key];
                hasUpdated = true;
            }
        }

        if (!hasUpdated) {
            return sendError(res, 400, "No fields were updated", {
                details: "Nothing to update, values are the same",
            });
        }

        card.updated_at = Date.now();
        card.updated_by = user_id;
        const updatedCard = await card.save();

        return sendSuccess(res, "Card updated successfully", updatedCard);
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

async function DeleteCard(req, res) {}

// trong trường hợp người dùng đang mở card ra và muốn di chuyển nó sang một list khác trong cùng board
async function MoveCard(req, res) {
    try {
        const { user_id, board_id, old_list_id, new_list_id, card_id } =
            req.body;
        // check if user is a member of the board
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found");
        }
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
        }
        // check if list exists
        const oldList = await List.findById(old_list_id);
        if (!oldList) {
            return sendError(res, 404, "Old list not found");
        }
        const newList = await List.findById(new_list_id);
        if (!newList) {
            return sendError(res, 404, "New list not found");
        }
        // check if list in board
        if (String(oldList.board_id) !== board_id) {
            return sendError(res, 403, "Old list does not belong to the board");
        }
        if (String(newList.board_id) !== board_id) {
            return sendError(res, 403, "New list does not belong to the board");
        }
        // check if card exists
        const card = await Card.findById(card_id);
        if (!card) {
            return sendError(res, 404, "Card not found");
        }
        // check if card in old list
        const cardInOldList = oldList.list_cards.find(
            (card) => String(card.card_id) === card_id
        );
        if (!cardInOldList) {
            return sendError(res, 403, "Card does not belong to the list");
        }
        // check if card in new list
        const cardInNewList = newList.list_cards.find(
            (card) => String(card.card_id) === card_id
        );
        if (cardInNewList) {
            return sendError(res, 403, "Card already in the new list");
        }
        // move card
        oldList.list_cards = oldList.list_cards.filter(
            (card) => String(card.card_id) !== card_id
        );
        newList.list_cards.push({ card_id: card_id });
        await oldList.save();
        await newList.save();
        return sendSuccess(res, "Card moved successfully");
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

async function AssignUserToCard(req, res) {
    try {
        const { user_id, board_id, list_id, card_id, assign_user_id } =
            req.body;
        // check if user is a member of the board (member with role editor or admin)
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found");
        }
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
        }
        // check if list exists
        const list = await List.findById(list_id);
        if (!list) {
            return sendError(res, 404, "List not found");
        }
        // check if list in board
        if (String(list.board_id) !== board_id) {
            return sendError(res, 403, "List does not belong to the board");
        }
        // check if card exists
        const card = await Card.findById(card_id);
        if (!card) {
            return sendError(res, 404, "Card not found");
        }
        // check if card in list
        const cardInList = list.list_cards.find(
            (card) => String(card.card_id) === card_id
        );
        if (!cardInList) {
            return sendError(res, 403, "Card does not belong to the list");
        }
        // add assignees
        card.card_assignees.push({ card_assignee_id: assign_user_id });
        await card.save();
        sendSuccess(res, "Succesfull assign user to card");
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

async function RemoveUserFromCard(req, res) {
    try {
        const { user_id, board_id, list_id, card_id, remove_user_id } =
            req.body;
        // check if user is a member of the board (member with role editor or admin)
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found");
        }
        const isUserExist = board.board_collaborators.find(
            (collaborator) => collaborator.board_collaborator_id == user_id
        );
        if (!isUserExist) {
            if (String(board.created_by) !== user_id) {
                return sendError(res, 401, "User not authorized", "GetList");
            }
        }
        // check if list exists
        const list = await List.findById(list_id);
        if (!list) {
            return sendError(res, 404, "List not found");
        }
        // check if list in board
        if (String(list.board_id) !== board_id) {
            return sendError(res, 403, "List does not belong to the board");
        }
        // check if card exists
        const card = await Card.findById(card_id);
        if (!card) {
            return sendError(res, 404, "Card not found");
        }
        // check if card in list
        const cardInList = list.list_cards.find(
            (card) => String(card.card_id) === card_id
        );
        if (!cardInList) {
            return sendError(res, 403, "Card does not belong to the list");
        }
        // remove assignee
        card.card_assignees = card.card_assignees.filter(
            (assignee) => String(assignee.card_assignee_id) !== remove_user_id
        );
        card.save();
        return sendSuccess(res, "Success remove user from card");
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Internal server error");
    }
}

async function AddAttachmentToCard(req, res) {}

async function AddCommentToCard(req, res) {}

async function GetCommentsInCard(req, res) {}

async function AssignLabelToCard(req, res) {}

// Lưu trữ card không còn hoạt động
async function ArchiveCard(params) {}

async function UpdateCheckListsInCard(req, res) {}

module.exports = {
    CreateCard,
    GetCard,
    UpdateCard,
    MoveCard,
    AssignUserToCard,
    RemoveUserFromCard,
};
