const Board = require("../models/Board");
const User = require("../models/User");
const logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/response");

async function CreateBoard(req, res) {
    const boardReqCreate = req.body;
    const user = await User.findById(boardReqCreate.user_id);
    if (!user) {
        return sendError(res, 401, "Unauthorized", {
            details: "User is not registed"
        });
    }
    try {
        let board = new Board({
            board_title: boardReqCreate.board_title,
            board_description: boardReqCreate.board_description,
            board_is_public: boardReqCreate.board_is_public,
            board_lists: boardReqCreate.board_lists,
            board_collaborators: boardReqCreate.board_collaborators,
            created_by: boardReqCreate.user_id,
            created_at: Date.now()
        });

        const newBoard = await board.save();
        user.boards.push({ board_id: newBoard._id, role: "ADMIN" });
        await user.save();

        return sendSuccess(res, "Create board success", newBoard._id);
    } catch (error) {
        logger.error(`Error with create board : ${error}`);
        return sendError(res, 500, `Error while create board`, {
            details: error
        });
    }
}

async function GetBoard(req, res) {
    try {
        const { user_id, board_id } = req.body;

        // Kiểm tra người dùng có tồn tại không
        const user = await User.findById(user_id);
        if (!user) {
            return sendError(res, 401, "Unauthorized", {
                details: "User is not registered"
            });
        }

        // Tìm bảng bằng ID
        const board = await Board.findById(board_id)
            .populate(
                "board_collaborators.board_collaborator_id",
                "user_full_name user_email"
            )
            .populate("created_by", "user_full_name user_email");
        // .populate("board_lists.list_id");

        // Kiểm tra nếu không tìm thấy bảng
        if (!board) {
            return sendError(res, 404, "Board not found", {
                details: "The requested board does not exist"
            });
        }

        // Kiểm tra nếu user là người tạo bảng
        if (String(board.created_by._id) === String(user_id)) {
            return sendSuccess(res, "Successfully retrieved board data", board);
        }

        // Kiểm tra nếu user là cộng tác viên
        const isCollaborator = board.board_collaborators.some(
            collab =>
                String(collab.board_collaborator_id._id) === String(user_id)
        );

        if (!isCollaborator) {
            return sendError(res, 403, "Access Denied", {
                details: "User is not a member or admin of the board"
            });
        }

        // Nếu đạt một trong hai điều kiện trên, trả về dữ liệu bảng
        sendSuccess(res, "Successfully retrieved board data", board);
    } catch (error) {
        // Xử lý lỗi hệ thống
        logger.error(`Error with GetBoard: ${error}`);
        sendError(res, 500, "Internal Server Error", {
            details: error.message
        });
    }
}

async function UpdateBoard(req, res) {
    try {
        const { board_id, board_update_details, user_id } = req.body;

        // Kiểm tra object board_update_details có rỗng không
        if (
            !board_update_details ||
            Object.keys(board_update_details).length === 0
        ) {
            return sendError(res, 400, "No data to update", {
                details: "No valid fields provided"
            });
        }

        // Tìm bảng và kiểm tra quyền sở hữu hoặc quyền chỉnh sửa
        const board = await Board.findOne({
            _id: board_id,
            $or: [
                { created_by: user_id }, // Người tạo
                {
                    "board_collaborators.board_collaborator_id": user_id, // Cộng tác viên
                    "board_collaborators.board_collaborator_role": "EDITOR" // Chỉ "EDITOR" mới có quyền chỉnh sửa
                }
            ]
        });

        if (!board) {
            return sendError(res, 404, "Board not found or unauthorized", {
                details: "User does not have access to this board"
            });
        }

        // Chỉ cập nhật các trường hợp lệ
        const allowedFields = [
            "board_title",
            "board_description",
            "board_is_public",
            "board_collaborators",
            "board_lists"
        ];

        // Cập nhật các trường hợp lệ
        let hasUpdated = false;

        for (const key in board_update_details) {
            if (
                allowedFields.includes(key) &&
                board[key] !== board_update_details[key]
            ) {
                board[key] = board_update_details[key];
                hasUpdated = true;
            }
        }

        // Nếu không có thay đổi, trả về lỗi
        if (!hasUpdated) {
            return sendError(res, 400, "No fields were updated", {
                details: "Nothing to update, values are the same"
            });
        }

        // Lưu thay đổi vào CSDL
        const updatedBoard = await board.save();
        // await updatedBoard
        //     .populate("created_by", "user_full_name user_email")
        //     .populate(
        //         "board_collaborators.board_collaborator_id",
        //         "user_full_name user_email"
        //     )
        //     .populate("board_lists.list_id")
        //     .execPopulate();

        // Trả về thành công
        return sendSuccess(res, "Board updated successfully", updatedBoard);
    } catch (error) {
        logger.error(`Error with UpdateBoard: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message
        });
    }
}

async function DeleteBoard(req, res) {
    try {
        const { board_id, user_id } = req.body;

        // Tìm và xóa bảng chỉ trong một bước
        const deletedBoard = await Board.findOneAndDelete({
            _id: board_id,
            created_by: user_id // Kiểm tra người tạo
        });

        // Nếu không tìm thấy bảng, trả về lỗi
        if (!deletedBoard) {
            return sendError(res, 404, "Board not found or unauthorized", {
                details: "User does not have permission to delete this board"
            });
        }

        // Nếu cần xóa các dữ liệu liên quan, bạn có thể thêm vào đây
        // Ví dụ: await List.deleteMany({ board_id });

        // Trả về phản hồi thành công
        return sendSuccess(res, "Board deleted successfully", {
            board_id: board_id
        });
    } catch (error) {
        logger.error(`Error with DeleteBoard: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message
        });
    }
}

module.exports = { CreateBoard, GetBoard, UpdateBoard, DeleteBoard };
