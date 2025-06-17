const Card = require("../models/Card");
const List = require("../models/List.js");
const Board = require("../models/Board.js");
const logger = require("../utils/logger.js");
const { sendError, sendSuccess } = require("../utils/response.js");
const User = require("../models/User.js");
const Attachment = require("../models/Attachment.js");
const path = require("path");
const { deleteCard } = require("../utils/dbHelper.js");
const upload = require("../configs/storageConfig.js").upload;
const { getIO, onlineUsers, sendToSocket } = require("../sockets/index.js");
const { notify } = require("./notificationController.js");
const fs = require("fs");

async function CreateCard(req, res) {
    try {
        const {
            user_id,
            board_id,
            list_id,
            card_title,
            card_duration,
            card_description,
        } = req.body;
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
            card_description: card_description,
            card_duration: card_duration,
            created_by: user_id,
        });
        const card = await newCard.save();
        // add card to list
        list.list_cards.push({
            card_id: card._id,
        });
        await list.save();
        const collaborators = board.board_collaborators.map(
            (collaborator) => collaborator.board_collaborator_id
        );
        // gửi thông tin về card mới tạo cho người dùng
        for (let collaborator of collaborators) {
            if (onlineUsers.has(collaborator.toString())) {
                const socketId = onlineUsers.get(collaborator.toString());
                await sendToSocket(socketId, "card:allmember:created", {
                    card: card,
                    list_id: list_id,
                    board_id: board_id,
                })
            }
        }
        // notify các thành viên về viêc tạo card mới
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
        // add assignee info
        const assignees = [];
        for (const assignee of card.card_assignees) {
            const user = await User.findById(assignee.card_assignee_id).select(
                "user_full_name user_email user_avatar_url"
            );
            assignees.push(user);
        }
        let cardInfo = card.toObject();
        cardInfo.card_assignees = assignees;
        return sendSuccess(res, 200, cardInfo);
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
            "card_duration",
            "card_completed",
            "card_priority",
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
        const collaborators = board.board_collaborators.map(
            (collaborator) => collaborator.board_collaborator_id
        );
        // gửi thông tin về card đã cập nhật cho người dùng
        for (let collaborator of collaborators) {
            if (onlineUsers.has(collaborator.toString())) {
                const socketId = onlineUsers.get(collaborator.toString());
                await sendToSocket(socketId, "card:allmember:updated", {
                    card: updatedCard,
                    list_id: list_id,
                    board_id: board_id,
                })
            }
        }

        // notify các thành viên card và owner board về việc cập nhật card
        const cardAssignees = updatedCard.card_assignees.map(
            (assignee) => assignee.card_assignee_id
        );

        const sendNotiResult = await notify({
            sender_id: user_id,
            receiver_ids: cardAssignees,
            title: "Card Updated",
            message: `Card "${updatedCard.card_title}" has been updated.`,
            reference: {
                type: "CARD",
                id: updatedCard.card_id,
            },
        });
        if (sendNotiResult !== "OK") {
            logger.error("Failed to send notification:", sendNotiResult);
        }
        return sendSuccess(res, "Card updated successfully", updatedCard);
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

async function DeleteCard(req, res) {
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
        // lấy danh sach assignees của card
        const assignees = card.card_assignees.map(
            (assignee) => assignee.card_assignee_id
        );
        // xóa card 
        const cardDeleteResult = await deleteCard(card_id);
        if (cardDeleteResult.message !== "OK") {
            return sendError(res, 500, cardDeleteResult.message);
        }
        // remove card from list
        list.list_cards = list.list_cards.filter(
            (card) => String(card.card_id) !== card_id
        );
        await list.save();
        // gửi thông tin card bị xóa tới tất cả thành viên
        for (let collaborator of board.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "card:allmember:deleted", {
                    card_id: card_id,
                    list_id: list_id,
                    board_id: board_id,
                })
            }
        }

        // notify các thành viên card và owner board về việc xóa card
        const assigneesAndCreator = [...assignees, board.created_by];

        const sendNotiResult = await notify({
            sender_id: user_id,
            receiver_ids: assigneesAndCreator,
            title: "Card Deleted",
            message: `Card "${card.card_title}" has been deleted.`,
            reference: "Card",
        });
        if (sendNotiResult !== "OK") {
            logger.error("Failed to send notification:", sendNotiResult);
        }

        return sendSuccess(res, "Card deleted successfully");
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

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
        // gửi thông tin về card đã di chuyển cho người dùng
        for (let collaborator of board.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "card:allmember:move", {
                    card_id: card_id,
                    old_list_id: old_list_id,
                    new_list_id: new_list_id,
                    board_id: board_id,
                })
            }
        }
        return sendSuccess(res, "Card moved successfully");
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

// move card with position
async function MoveCardWithPosition(req, res) {
    try {
        const {
            user_id,
            board_id,
            old_list_id,
            new_list_id,
            card_id,
            new_card_index,
        } = req.body;

        // 1. Kiểm tra board & quyền truy cập
        const board = await Board.findById(board_id);
        if (!board) return sendError(res, 404, "Board not found");

        const isCollaborator =
            board.created_by.toString() === user_id ||
            board.board_collaborators.some(
                (c) => c.board_collaborator_id.toString() === user_id
            );
        if (!isCollaborator)
            return sendError(res, 401, "User not authorized", "MoveCard");

        // 2. Lấy oldList và newList, kiểm tra thuộc board
        const [oldList, newList] = await Promise.all([
            List.findById(old_list_id),
            List.findById(new_list_id),
        ]);
        if (!oldList)
            return sendError(res, 404, "Old list not found");
        if (!newList)
            return sendError(res, 404, "New list not found");
        if (oldList.board_id.toString() !== board_id)
            return sendError(res, 403, "Old list does not belong to the board");
        if (newList.board_id.toString() !== board_id)
            return sendError(res, 403, "New list does not belong to the board");

        // kiểm tra xem 2 list có khác nhau không
        if (oldList._id.toString() === newList._id.toString()) {
            // trường hợp di chuyển card trong cùng 1 list
            if (new_card_index < 0 || new_card_index >= oldList.list_cards.length) {
                return sendError(res, 400, "Invalid new card index");
            }
            // 3. Kiểm tra card tồn tại & có trong oldList
            const cardIndex = oldList.list_cards.findIndex(
                (c) => c.card_id.toString() === card_id
            );
            if (cardIndex === -1)
                return sendError(res, 403, "Card does not belong to the old list");
            // di chuyển thẻ trong cùng 1 list
            const [movedCard] = oldList.list_cards.splice(cardIndex, 1);
            oldList.list_cards.splice(new_card_index, 0, movedCard);
            // lưu lại list
            await oldList.save();
            return sendSuccess(res, "Card moved successfully within the same list");
        }

        // 3. Kiểm tra card tồn tại & có trong oldList
        const card = await Card.findById(card_id);
        if (!card) return sendError(res, 404, "Card not found");

        const cardIndex = oldList.list_cards.findIndex(
            (c) => c.card_id.toString() === card_id
        );
        if (cardIndex === -1)
            return sendError(res, 403, "Card does not belong to the old list");

        const alreadyInNewList = newList.list_cards.some(
            (c) => c.card_id.toString() === card_id
        );
        if (alreadyInNewList)
            return sendError(res, 403, "Card already exists in the new list");

        // 4. Di chuyển thẻ
        const [movedCard] = oldList.list_cards.splice(cardIndex, 1);
        newList.list_cards.splice(new_card_index, 0, movedCard);

        // 5. Lưu cả hai list
        await Promise.all([oldList.save(), newList.save()]);
        // gửi thông tin về card đã di chuyển cho người dùng
        for (let collaborator of board.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "card:allmember:move:position", {
                    card_id: card_id,
                    old_list_id: old_list_id,
                    new_list_id: new_list_id,
                    board_id: board_id,
                    new_card_index: new_card_index,
                })
            }
        }

        return sendSuccess(res, "Card moved successfully to new list with position");
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
        // check asssignees exist
        const assignee = await User.findById(assign_user_id);
        if (!assignee) {
            return sendError(res, 404, "User not found to add not found");
        }
        // check if user is already assigned to the card
        const assigneeExist = card.card_assignees.find(
            (assignee) => String(assignee.card_assignee_id) === assign_user_id
        );
        if (assigneeExist) {
            return sendError(res, 403, "User already assigned to the card");
        }
        // add assignees

        const assignees = card.card_assignees.map(
            (assignee) => assignee.card_assignee_id
        );

        assignees.push(board.created_by);


        card.card_assignees.push({ card_assignee_id: assign_user_id });
        await card.save();

        // gửi thay đổi realtime tới tất cả thành viên trong board
        for (let collaborator of board.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "card:allmember:assign", {
                    card_id: card_id,
                    list_id: list_id,
                    board_id: board_id,
                    assign_user_id: assign_user_id,
                })
            }
        }

        // notify các thành viên card và owner board về việc gán user vào card
        const sendNotiResult = await notify({
            sender_id: user_id,
            receiver_ids: assignees,
            title: "User Assigned to Card",
            message: `User "${assignee.user_full_name}" has been assigned to card "${card.card_title}".`,
            reference: "Card",
        });
        if (sendNotiResult !== "OK") {
            logger.error("Failed to send notification:", sendNotiResult);
        }

        // gửi thông báo cho người dùng được thêm vào card
        const sendNotiToAssigneeResult = await notify({
            sender_id: user_id,
            receiver_ids: [assign_user_id],
            title: "You have been assigned to a Card",
            message: `You have been assigned to card "${card.card_title}" in board "${board.board_name}".`,
            reference: "Card",
        });
        if (sendNotiToAssigneeResult !== "OK") {
            logger.error("Failed to send notification to assignee:", sendNotiToAssigneeResult);
        }

        return sendSuccess(res, "Succesfull assign user to card");
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
        await card.save();

        // gửi thay đổi realtime tới tất cả thành viên trong board
        for (let collaborator of board.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "card:allmember:remove", {
                    card_id: card_id,
                    list_id: list_id,
                    board_id: board_id,
                    remove_user_id: remove_user_id,
                })
            }
        }

        // notify các thành viên card và owner board và user bị remove về việc gỡ user khỏi card
        const assignees = card.card_assignees.map(
            (assignee) => assignee.card_assignee_id
        );
        assignees.push(board.created_by);

        const sendNotiResult = await notify({
            sender_id: user_id,
            receiver_ids: assignees,
            title: "User Removed from Card",
            message: `User "${remove_user_id}" has been removed from card "${card.card_title}".`,
            reference: "Card",
        });
        if (sendNotiResult !== "OK") {
            logger.error("Failed to send notification:", sendNotiResult);
        }
        // gửi thong tin thành viên bị remove khỏi card
        const sendNotiResult2 = await notify({
            sender_id: user_id,
            receiver_ids: [remove_user_id],
            title: "User Removed from Card",
            message: `You have been removed from card "${card.card_title}".`,
            reference: "Card",
        });
        if (sendNotiResult2 !== "OK") {
            logger.error("Failed to send notification:", sendNotiResult2);
        }

        return sendSuccess(res, "Success remove user from card");
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Internal server error");
    }
}
// luu file vào folder upload trong server
// sau đó lưu đường dẫn vào card
async function AddAttachmentToCard(req, res) {
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
        // lưu file vào folder upload trong server
        // sau đó lưu đường dẫn vào card
        const file = req.file;
        if (!file) {
            return sendError(res, 400, "File not found");
        }
        // ghi file vao folder uploads
        upload.single("file")(req, res, async (err) => {
            if (err) {
                return sendError(res, 400, "File upload failed", err);
            }
            // lưu đường dẫn vào card
            const newAttachment = new Attachment({
                attachment_card_id: card._id,
                attachment_url: file.path,
                attachment_name: file.originalname,
                attachment_type: file.mimetype,
                created_by: user_id,
            });
            const attachment = await newAttachment.save();
            card.card_attachments.push({ card_attachment_id: attachment._id });
            await card.save();
            // gửi thông tin về file đã upload cho người dùng
            for (let collaborator of board.board_collaborators) {
                if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                    const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                    await sendToSocket(socketId, "card:allmember:add:attachment", {
                        card_id: card_id,
                        list_id: list_id,
                        board_id: board_id,
                        attachment: attachment,
                    })
                }
            }
            return sendSuccess(res, "File uploaded successfully", attachment);
        });
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

async function RemoveAttachmentFromCard(req, res) {
    try {
        const { user_id, board_id, list_id, card_id, attachment_id } = req.body;
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
        // check if attachment exists
        const attachment = await Attachment.findById(attachment_id);
        if (!attachment) {
            return sendError(res, 404, "Attachment not found");
        }
        // check if attachment in card
        const attachmentInCard = card.card_attachments.find(
            (attachment) => String(attachment.card_attachment_id) === attachment_id
        );
        if (!attachmentInCard) {
            return sendError(res, 403, "Attachment does not belong to the card");
        }
        // remove attachment from card
        card.card_attachments = card.card_attachments.filter(
            (attachment) => String(attachment.card_attachment_id) !== attachment_id
        );
        await card.save();
        // remove attachment from database
        await Attachment.findByIdAndDelete(attachment_id);
        // remove file from server
        const filePath = attachment.file_path;
        fs.unlink(filePath, (err) => {
            if (err) {
                logger.error(err.message);
                return sendError(res, 500, "Internal server error");
            }
        });
        // gửi thông tin về file đã xóa cho người dùng
        for (let collaborator of board.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "card:allmember:removed:attachment", {
                    card_id: card_id,
                    list_id: list_id,
                    board_id: board_id,
                    attachment_id: attachment_id,
                })
            }
        }

        return sendSuccess(res, "Attachment removed successfully");
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

async function GetAttachmentInCard(req, res) {
    try {
        const { user_id, board_id, list_id, card_id, attachment_id } = req.body;
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
        // check if attachment exists
        const attachment = await Attachment.findById(attachment_id);
        if (!attachment) {
            return sendError(res, 404, "Attachment not found");
        }
        // check if attachment in card
        const attachmentInCard = card.card_attachments.find(
            (attachment) => String(attachment.card_attachment_id) === attachment_id
        );
        if (!attachmentInCard) {
            return sendError(res, 403, "Attachment does not belong to the card");
        }
        // if all checks pass, return the attachment
        // get the attachment and send it to the client
        const attachmentPath = path.resolve(__dirname, '..', attachment.attachment_url);
        return res.download(attachmentPath, (err) => {
            if (err) {
                logger.error('Error sending file:', err);
                return sendError(res, 500, 'Internal server error');
            }
        });
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

async function UpdateAttachmentInCard(req, res) { }

async function AddCommentToCard(req, res) { }

async function GetCommentsInCard(req, res) { }

// async function AssignLabelToCard(req, res) {}

// Lưu trữ card không còn hoạt động
async function ArchiveCard(params) { }

async function UpdateCheckListsInCard(req, res) { }

module.exports = {
    CreateCard,
    GetCard,
    UpdateCard,
    MoveCard,
    DeleteCard,
    AssignUserToCard,
    RemoveUserFromCard,
    AddAttachmentToCard,
    RemoveAttachmentFromCard,
    GetAttachmentInCard,
    MoveCardWithPosition
};
