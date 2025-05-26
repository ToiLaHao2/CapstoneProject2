const Card = require("../models/Card");
const List = require("../models/List.js");
const Board = require("../models/Board.js");
const logger = require("../utils/logger.js");
const { sendError, sendSuccess } = require("../utils/response.js");
const User = require("../models/User.js");
const Attachment = require("../models/Attachment.js");
const path = require("path");
const upload = require("../configs/storageConfig.js").upload;

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

        console.log(card_update_details);

        return sendSuccess(res, "Card updated successfully", updatedCard);
    } catch (error) {
        logger.error(error.message);
        return sendError(res, 500, "Internal server error");
    }
}

async function DeleteCard(req, res) { }

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

        return res.status(200).json({ message: "Card moved successfully" });
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
        const fs = require("fs");
        const filePath = attachment.file_path;
        fs.unlink(filePath, (err) => {
            if (err) {
                logger.error(err.message);
                return sendError(res, 500, "Internal server error");
            }
        });
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

async function AddCheckListsToCard(req, res) { }

async function UpdateCheckListsInCard(req, res) { }

module.exports = {
    CreateCard,
    GetCard,
    UpdateCard,
    MoveCard,
    AssignUserToCard,
    RemoveUserFromCard,
    AddAttachmentToCard,
    RemoveAttachmentFromCard,
    GetAttachmentInCard,
    MoveCardWithPosition
};
