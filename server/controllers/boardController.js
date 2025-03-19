const Board = require("../models/Board");
const List = require("../models/List");
const User = require("../models/User");
const logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/response");

async function CreateBoard(req, res) {
    const boardReqCreate = req.body;
    const user = await User.findById(boardReqCreate.user_id);
    if (!user) {
        return sendError(res, 401, "Unauthorized", {
            details: "User is not registed",
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
            created_at: Date.now(),
        });

        const newBoard = await board.save();
        user.user_boards.push({ board_id: newBoard._id, role: "ADMIN" });
        await user.save();
        if (boardReqCreate.board_collaborators.length > 0) {
            for (let collaborator of boardReqCreate.board_collaborators) {
                const collaboratorUser = await User.findById(
                    collaborator.board_collaborator_id
                );
                if (collaboratorUser) {
                    collaboratorUser.user_boards.push({
                        board_id: newBoard._id,
                        role: "MEMBER",
                    });
                    await collaboratorUser.save();
                }
            }
        }
        logger.info("Successfull create board");
        return sendSuccess(res, "Create board success", newBoard._id);
    } catch (error) {
        logger.error(`Error with create board : ${error}`);
        return sendError(res, 500, `Error while create board`, {
            details: error.message,
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
                details: "User is not registered",
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
                details: "The requested board does not exist",
            });
        }

        // Kiểm tra nếu user là người tạo bảng
        if (String(board.created_by._id) === String(user_id)) {
            return sendSuccess(res, "Successfully retrieved board data", board);
        }

        // Kiểm tra nếu user là cộng tác viên
        const isCollaborator = board.board_collaborators.some(
            (collab) =>
                String(collab.board_collaborator_id._id) === String(user_id)
        );

        if (!isCollaborator) {
            return sendError(res, 403, "Access Denied", {
                details: "User is not a member or admin of the board",
            });
        }

        // Nếu đạt một trong hai điều kiện trên, trả về dữ liệu bảng
        sendSuccess(res, "Successfully retrieved board data", board);
    } catch (error) {
        // Xử lý lỗi hệ thống
        logger.error(`Error with GetBoard: ${error}`);
        sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

async function GetAllBoardByUserId(req, res) {
    try {
        const { user_id } = req.body;
        let boards = [];
        const user = await User.findById(user_id);
        for (const boardinfo of user.user_boards) {
            const board = await Board.findById(boardinfo.board_id);
            if (board) {
                boards.push(board);
            } else {
                return sendError(res, 404, "Board not found", {
                    details: "The requested board does not exist",
                });
            }
        }
        return sendSuccess(res, "Get all boards by user id success", boards);
    } catch (error) {
        return sendError(res, 500, "Internal Server Error", { details: error });
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
                details: "No valid fields provided",
            });
        }

        // Tìm bảng và kiểm tra quyền sở hữu hoặc quyền chỉnh sửa
        const board = await Board.findOne({
            _id: board_id,
            $or: [
                { created_by: user_id }, // Người tạo
                {
                    "board_collaborators.board_collaborator_id": user_id, // Cộng tác viên
                    "board_collaborators.board_collaborator_role": "EDITOR", // Chỉ "EDITOR" mới có quyền chỉnh sửa
                },
            ],
        });

        if (!board) {
            return sendError(res, 404, "Board not found or unauthorized", {
                details: "User does not have access to this board",
            });
        }

        // Chỉ cập nhật các trường hợp lệ
        const allowedFields = [
            "board_title",
            "board_description",
            "board_is_public",
            "board_collaborators",
            "board_lists",
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
                details: "Nothing to update, values are the same",
            });
        }

        board.updated_at = Date.now();

        // Lưu thay đổi vào CSDL
        const updatedBoard = await board.save();

        // Trả về thành công
        return sendSuccess(res, "Board updated successfully", updatedBoard);
    } catch (error) {
        logger.error(`Error with UpdateBoard: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

async function DeleteBoard(req, res) {
    try {
        const { board_id, user_id } = req.body;

        // Tìm và xóa bảng chỉ trong một bước
        const deletedBoard = await Board.findOneAndDelete({
            _id: board_id,
            created_by: user_id, // Kiểm tra người tạo
        });

        // Nếu không tìm thấy bảng, trả về lỗi
        if (!deletedBoard) {
            return sendError(res, 404, "Board not found or unauthorized", {
                details: "User does not have permission to delete this board",
            });
        }

        // Nếu cần xóa các dữ liệu liên quan, bạn có thể thêm vào đây
        // xóa thêm các lists , cards, comments và các mục liên quan
        // nên tạo hàm deleteManyData để xóa tất cả các dữ liệu liên quan
        // Ví dụ:
        await List.deleteMany({ board_id: board_id });

        // Trả về phản hồi thành công
        return sendSuccess(res, "Board deleted successfully", {
            board_id: board_id,
        });
    } catch (error) {
        logger.error(`Error with DeleteBoard: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error,
        });
    }
}

async function AddMemberToBoard(req, res) {
    try {
        const { board_id, user_id, member_id, member_role } = req.body;

        // Tìm bảng và kiểm tra quyền sở hữu hoặc quyền chỉnh sửa
        const board = await Board.findOne({
            _id: board_id,
            created_by: user_id, // Chỉ người tạo mới có thể thêm thành viên
        });

        if (!board) {
            return sendError(res, 404, "Board not found or unauthorized", {
                details: "User does not have access to this board",
            });
        }

        const member = await User.findById(member_id);

        if (!member) {
            return sendError(res, 404, "Member not found", {
                details: "The user you are trying to add does not exist",
            });
        }

        // Kiểm tra thành viên đã tồn tại trong danh sách cộng tác viên chưa
        const isMember = board.board_collaborators.some(
            (collab) =>
                String(collab.board_collaborator_id) === String(member_id)
        );

        if (isMember) {
            return sendError(res, 400, "Member already exists", {
                details: "The user is already a member of this board",
            });
        }

        // Thêm thành viên vào danh sách cộng tác viên
        board.board_collaborators.push({
            board_collaborator_id: member_id,
            board_collaborator_role: member_role,
        });

        member.user_boards.push({ board_id: board_id, role: "MEMBER" });

        // Lưu thay đổi vào CSDL
        const updatedBoard = await board.save();
        await member.save();
        // Trả về phản hồi thành công
        return sendSuccess(res, "Member added successfully", updatedBoard);
    } catch (error) {
        logger.error(`Error with AddMemberToBoard: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

async function RemoveMemberFromBoard(req, res) {
    try {
        const { board_id, user_id, member_id } = req.body;
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", {
                details: "The requested board does not exist",
            });
        }
        if (String(board.created_by) !== String(user_id)) {
            return sendError(res, 403, "Access Denied", {
                details: "User is not the creator of this board",
            });
        }
        const member = await User.findById(member_id);
        if (!member) {
            return sendError(res, 404, "Member not found", {
                details: "The requested member does not exist",
            });
        }
        // Kiểm tra thành viên có tồn tại trong danh sách cộng tác viên chưa
        const isMember = board.board_collaborators.some(
            (collab) =>
                String(collab.board_collaborator_id) === String(member_id)
        );
        if (!isMember) {
            return sendError(res, 404, "Member not found", {
                details: "The requested member does not exist in this board",
            });
        }

        // Xóa thành viên khỏi danh sách cộng tác viên
        board.board_collaborators = board.board_collaborators.filter(
            (collab) =>
                String(collab.board_collaborator_id) !== String(member_id)
        );
        // Lưu thay đổi vào CSDL
        member.user_boards = member.user_boards.filter(
            (board) => String(board.board_id) !== String(board_id)
        );
        const updatedBoard = await board.save();
        await member.save();
        // Trả về phản hồi thành công
        return sendSuccess(res, "Member removed successfully", updatedBoard);
    } catch (error) {
        logger.error(`Error with RemoveMemberFromBoard: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

async function UpdateMemberRole(req, res) {
    const { user_id, board_id, member_id, new_member_role } = req.body;
    try {
        // Lấy thông tin board
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", {
                details: "The requested board does not exist",
            });
        }
        // Kiểm tra quyền của người dùng
        if (String(board.created_by) !== String(user_id)) {
            return sendError(res, 403, "Access Denied", {
                details: "User is not the creator of this board",
            });
        }
        // Lấy thông tin thành viên
        const member = await User.findById(member_id);
        if (!member) {
            return sendError(res, 404, "Member not found", {
                details: "The requested member does not exist",
            });
        }
        // Kiểm tra thành viên có tồn tại trong danh sách cộng tác viên chưa
        const isMember = board.board_collaborators.some(
            (collab) =>
                String(collab.board_collaborator_id) === String(member_id)
        );
        if (!isMember) {
            return sendError(res, 403, "Access Denied", {
                details:
                    "The requested member is not a collaborator of this board",
            });
        }
        // Cập nhật vai trò của thành viên
        board.board_collaborators = board.board_collaborators.map((collab) => {
            if (String(collab.board_collaborator_id) === String(member_id)) {
                collab.board_collaborator_role = new_member_role;
            }
            return collab;
        });
        // Lưu thay đổi vào CSDL
        const updatedBoard = await board.save();
        // Trả về phản hồi thành công
        return sendSuccess(
            res,
            "Member role updated successfully",
            updatedBoard
        );
    } catch (error) {
        // Kiểm tra quyền của người dùng
        logger.error(`Error with UpdateMemberRole: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

async function GetAllMembers(req, res) {
    try {
        const { board_id, user_id } = req.body;
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", {
                details: "The requested board does not exist",
            });
        }
        const isMember = board.board_collaborators.some(
            (collab) => String(collab.board_collaborator_id) === String(user_id)
        );
        console.log(isMember);
        if (isMember === false) {
            return sendError(res, 403, "Access Denied", {
                details: "User is not a collaborator of this board",
            });
        }
        const members = await User.find({
            _id: {
                $in: board.board_collaborators.map(
                    (collab) => collab.board_collaborator_id
                ),
            },
        });
        return sendSuccess(res, "Get all members success", members);
    } catch (error) {
        logger.error(`Error with GetAllMembers: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

// Thay đổi trạng thái công khai của bảng
async function UpdatePrivacy(req, res) {
    const { board_id, user_id, new_privacy } = req.body;
    try {
        // Lấy thông tin board
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", {
                details: "The requested board does not exist",
            });
        }
        // Kiểm tra quyền của người dùng
        if (String(board.created_by) !== String(user_id)) {
            return sendError(res, 403, "Access Denied", {
                details: "User is not the creator of this board",
            });
        }
        // Cập nhật trạng thái công khai
        board.board_is_public = new_privacy;
        // Lưu thay đổi vào CSDL
        const updatedBoard = await board.save();
        // Trả về phản hồi thành công
        return sendSuccess(res, "Privacy updated successfully", updatedBoard);
    } catch (error) {
        logger.error(`Error with UpdatePrivacy: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

async function GetListsInBoard(req, res) {
    try {
        const { board_id, user_id } = req.body;
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", {
                details: "The requested board does not exist",
            });
        }
        const isMember = board.board_collaborators.some(
            (collab) => String(collab.board_collaborator_id) === String(user_id)
        );
        if (String(board.created_by) !== String(user_id)) {
            if (!isMember) {
                return sendError(res, 403, "Access Denied", {
                    details: "User is not a collaborator of this board",
                });
            }
        }

        let lists = [];

        for (const boardList of board.board_lists) {
            const list = await List.findById(boardList.list_id);
            if (list) {
                lists.push(list);
            }
        }

        return sendSuccess(res, "Get all lists success", lists);
    } catch (error) {
        logger.error(`Error with GetListsInBoard: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

async function AddListToBoard(req, res) {
    const { user_id, board_id, list_id, list_numerical_order } = req.body;
    try {
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", {
                details: "The requested board does not exist",
            });
        }
        if (String(board.created_by) !== String(user_id)) {
            return sendError(res, 403, "Access Denied", {
                details: "User is not the creator of this board",
            });
        }
        const list = await List.findById(list_id);
        if (!list) {
            return sendError(res, 404, "List not found", {
                details: "The requested list does not exist",
            });
        }
        const isList = board.board_lists.some(
            (boardList) => String(boardList.list_id) === String(list_id)
        );
        if (isList) {
            return sendError(res, 400, "List already exists", {
                details: "The list is already in this board",
            });
        }
        board.board_lists.push({
            list_numerical_order,
            list_id,
        });
        const updatedBoard = await board.save();
        return sendSuccess(res, "List added successfully", updatedBoard);
    } catch (error) {
        logger.error(`Error with AddListToBoard: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

async function MoveList(req, res) {
    const { user_id, board_id, list_id1, list_id2 } = req.body;
    try {
        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found", {
                details: "The requested board does not exist",
            });
        }
        if (String(board.created_by) !== String(user_id)) {
            return sendError(res, 403, "Access Denied", {
                details: "User is not the creator of this board",
            });
        }
        const list1 = await List.findById(list_id1);
        const list2 = await List.findById(list_id2);
        if (!list1 || !list2) {
            return sendError(res, 404, "List not found", {
                details: "The requested list does not exist",
            });
        }
        const isList1 = board.board_lists.some(
            (boardList) => String(boardList.list_id) === String(list_id1)
        );
        const isList2 = board.board_lists.some(
            (boardList) => String(boardList.list_id) === String(list_id2)
        );
        if (!isList1 || !isList2) {
            return sendError(res, 404, "List not found", {
                details: "The requested list is not in this board",
            });
        }
        const index1 = board.board_lists.findIndex(
            (boardList) => String(boardList.list_id) === String(list_id1)
        );
        const index2 = board.board_lists.findIndex(
            (boardList) => String(boardList.list_id) === String(list_id2)
        );
        board.board_lists[index1].list_id = list_id2;
        board.board_lists[index2].list_id = list_id1;
        const updatedBoard = await board.save();
        return sendSuccess(res, "List moved successfully", updatedBoard);
    } catch (error) {
        logger.error(`Error with MoveList: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

async function AssignLabelsToBoard(params) {}

// tùy chọn : lưu
async function ArchiveBoard(params) {}

async function CreateConversation(params) {}

async function ChangeBackgroundPicture() {}

module.exports = {
    CreateBoard,
    GetBoard,
    UpdateBoard,
    DeleteBoard,
    GetAllBoardByUserId,
    AddMemberToBoard,
    RemoveMemberFromBoard,
    UpdateMemberRole,
    GetAllMembers,
    UpdatePrivacy,
    GetListsInBoard,
    AddListToBoard,
    MoveList,
};
