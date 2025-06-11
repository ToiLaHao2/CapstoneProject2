const logger = require("./logger");
const Board = require("../models/Board");
const List = require("../models/List");
const Card = require("../models/Card");
const Checklist = require("../models/CheckList");
const Attachment = require("../models/Attachment");
const Comment = require("../models/Comment");
const User = require("../models/User");
const CheckListItem = require("../models/CheckListItem");
const fs = require("fs");

async function findByIdOrThrow(Model, id, options = {}) {
    const { selectFields, errorMessage, errorStatusCode } = options;

    try {
        // Tạo query để tìm tài liệu
        const query = Model.findById(id);
        if (selectFields) query.select(selectFields); // Chỉ lấy các trường cần thiết nếu có

        const document = await query;

        // Ném lỗi nếu không tìm thấy tài liệu
        if (!document) {
            const error = new Error(
                errorMessage || `${Model.modelName} with ID ${id} not found`
            );
            error.statusCode = errorStatusCode || 404;
            throw error;
        }

        // Trả về tài liệu nếu tìm thấy
        return document;
    } catch (error) {
        // Xử lý lỗi ngoài mong muốn (như lỗi kết nối)
        throw error.statusCode
            ? error
            : {
                message: "Error finding document",
                statusCode: 500,
                details: error.message,
            };
    }
}

async function findOneOrThrow(Model, condition, options = {}) {
    const { selectFields, errorMessage, errorStatusCode } = options;

    try {
        // Tạo query để tìm tài liệu
        const query = Model.findOne(condition);
        if (selectFields) query.select(selectFields); // Chỉ lấy các trường cần thiết nếu có

        const document = await query;

        // Ném lỗi nếu không tìm thấy tài liệu
        if (!document) {
            const error = new Error(
                errorMessage ||
                `${Model.modelName} not found for the given condition`
            );
            error.statusCode = errorStatusCode || 404;
            throw error;
        }

        // Trả về tài liệu nếu tìm thấy
        return document;
    } catch (error) {
        // Xử lý lỗi ngoài mong muốn (như lỗi kết nối)
        throw error.statusCode
            ? error
            : {
                message: "Error finding document",
                statusCode: 500,
                details: error.message,
            };
    }
}

// Xóa nhiều tài liệu dựa trên id của 1 model
// model lớn hơn sẽ gọi hàm xóa các model nhỏ hơn rồi return về lại 
// dựa trên 1 id của 1 model, dò các trường có id trong model đó
// và xóa các tài liệu có id đó
async function deleteBoard(id) {
    try {
        const board = await Board.findById(id);
        const users = board.board_collaborators.map(user => user.board_collaborator_id);
        // xóa thông tin board trong các user
        await User.updateMany(
            { _id: { $in: users } },
            { $pull: { user_boards: { board_id: id } } }
        );
        // loại thông tin của board trong với creator
        await User.findByIdAndUpdate(
            board.created_by,
            { $pull: { user_boards: { board_id: id } } }
        );
        // lấy các list trong board ar
        const lists = board.board_lists.map(list => list.list_id);
        // xóa các list trong board
        for (const listId of lists) {
            const messageDeleteList = await deleteList(listId);
            // đợi báo thành công
            if (messageDeleteList.message !== "OK") {
                throw new Error(messageDeleteList.message);
            }
        }
        // gọi hàm
        // xóa board
        await Board.findByIdAndDelete(id);
        return { message: "OK" };
    } catch (error) {
        // Xử lý lỗi nếu có
        logger.error("Error deleting documents:", error);
        throw {
            message: "Error deleting documents",
            statusCode: 500,
            details: error.message,
        };
    }
};

async function deleteList(id) {
    try {
        // lọc ra và delete các card trong list
        const list = await List.findById(id).populate("list_cards.card_id");
        if (!list) {
            throw {
                message: "List not found",
                statusCode: 404,
            };
        }
        // xóa các card trong list
        const cardIds = list.list_cards.map(card => card.card_id._id);
        // gọi hàm xóa từng card
        for (const cardId of cardIds) {
            const messageDeleteCard = await deleteCard(cardId);
            // đợi báo thành công
            if (messageDeleteCard.message !== "OK") {
                throw new Error(messageDeleteCard.message);
            }
        }
        // chờ báo thành công
        // xóa list
        await List.findByIdAndDelete(id);
        return { message: "OK" };
    } catch (error) {
        // Xử lý lỗi nếu có
        logger.error("Error deleting cards:", error);
        throw {
            message: "Error deleting cards",
            statusCode: 500,
            details: error.message,
        };
    }

}

async function deleteCard(id) {
    try {
        // Tìm card theo id
        const card = await Card.findById(id);
        // xóa checklist
        // gọi hàm xóa checklist
        // const messageDeteteCL = await deleteChecklist(card.card_checklist_id);
        // // đợi báo thành công
        // if (messageDeteteCL.message !== "OK") {
        //     throw new Error(messageDeteteCL.message);
        // }
        // xóa các attachment
        // const attachmentIds = card.card_attachments.map(attachment => attachment.card_attachment_id);
        // // gọi hàm xóa từng attachment
        // for (const attachmentId of attachmentIds) {
        //     const messageDeleteAttachment = await deleteAttachment(attachmentId);
        //     // đợi báo thành công
        //     if (messageDeleteAttachment.message !== "OK") {
        //         throw new Error(messageDeleteAttachment.message);
        //     }
        // }
        // // xóa các comment
        // const commentIds = card.card_comments.map(comment => comment.card_comment_id);
        // // gọi hàm xóa từng comment
        // for (const commentId of commentIds) {
        //     const messageDeleteComment = await deleteComment(commentId);
        //     // đợi báo thành công
        //     if (messageDeleteComment.message !== "OK") {
        //         throw new Error(messageDeleteComment.message);
        //     }
        // }
        // đợi báo thành công
        // xoa card
        await Card.findByIdAndDelete(id);
        return { message: "OK" };
    } catch (error) {
        // Xử lý lỗi nếu có
        logger.error("Error deleting card:", error);
        throw {
            message: "Error deleting card",
            statusCode: 500,
            details: error.message,
        };
    }
};

async function deleteChecklist(id) {
    try {
        // Tìm checklist theo id
        const checklist = await Checklist.findById(id);
        // xóa các cheklist items
        const checklistItems = checklist.checklist_items.map(item => item.item_id);
        // xóa checklist items
        await CheckListItem.deleteMany({
            _id: { $in: checklistItems }
        });
        await Checklist.findByIdAndDelete(id);
        return { message: "OK" };
    } catch (error) {
        // Xử lý lỗi nếu có
        logger.error("Error deleting checklist:", error);
        throw {
            message: "Error deleting checklist",
            statusCode: 500,
            details: error.message,
        };
    }
}

async function deleteAttachment(id) {
    try {
        // Tìm attachment theo id
        const attachment = await Attachment.findById(id);
        if (!attachment) {
            throw {
                message: "Attachment not found",
                statusCode: 404,
            };
        }
        // Xóa attachment
        // xóa attachment trong folder uploads
        const filePath = `uploads/${attachment.attachment_filename}`;

        if (fs.existsSync(filePath))
            fs.unlinkSync(filePath); // Xóa file nếu tồn tại
        // Xóa attachment trong database
        await Attachment.findByIdAndDelete(id);
        return { message: "OK" };
    }
    catch (error) {
        // Xử lý lỗi nếu có
        logger.error("Error deleting attachment:", error);
        throw {
            message: "Error deleting attachment",
            statusCode: 500,
            details: error.message,
        };
    }
}

async function deleteComment(id) {
    try {
        // Tìm comment theo id
        const comment = await Comment.findById(id);
        if (!comment) {
            throw {
                message: "Comment not found",
                statusCode: 404,
            };
        }
        // Xóa các comment reply
        const commentReplies = comment.comment_reply.map(reply => reply.comment_reply_id);
        // gọi lại hàm xóa từng comment reply
        for (const replyId of commentReplies) {
            const messageDeleteReply = await deleteComment(replyId);
            // đợi báo thành công
            if (messageDeleteReply.message !== "OK") {
                throw new Error(messageDeleteReply.message);
            }
        }
        // Xóa comment
        await Comment.findByIdAndDelete(id);
        return { message: "OK" };
    } catch (error) {
        // Xử lý lỗi nếu có
        logger.error("Error deleting comment:", error);
        throw {
            message: "Error deleting comment",
            statusCode: 500,
            details: error.message,
        };
    }
}

module.exports = {
    findByIdOrThrow, findOneOrThrow,
    deleteBoard, deleteList, deleteCard, deleteChecklist,
    deleteAttachment, deleteComment
};
