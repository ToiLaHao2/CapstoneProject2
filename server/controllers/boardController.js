const Board = require("../models/Board");
const List = require("../models/List");
const User = require("../models/User");
const { deleteBoard } = require("../utils/dbHelper");
const logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/response");
const { notify } = require("./notificationController");
const { getIO, sendToSocket } = require("../sockets/index");
const { onlineUsers } = require("../utils/onlineUser");

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

        board.board_collaborators.push({ board_collaborator_id: user._id, board_collaborator_role: "EDITOR" });

        const newBoard = await board.save();
        user.user_boards.push({ board_id: newBoard._id, role: "ADMIN" });
        await user.save();
        if (boardReqCreate.board_collaborators.length > 0) {
            // gửi board mới về cho các colaborators
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
                if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                    // nếu user đang online thì gửi board mới về cho họ
                    const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                    await sendToSocket(socketId, "board:allmember:created", {
                        board: newBoard,
                    })
                }
            }

            // notify các user đã được thêm vào board từ đầu nếu có
            const sendNotiResult = await notify({
                senderId: boardReqCreate.user_id,
                receiverIds: boardReqCreate.board_collaborators.map(
                    (collab) => collab.board_collaborator_id
                ),
                title: "You have been added to a new board",
                message: `You have been added to the board "${boardReqCreate.board_title}"`,
                reference: {
                    type: "BOARD",
                    boardId: newBoard._id,

                },
            });
            if (sendNotiResult !== "OK") {
                logger.error(
                    `Failed to notify collaborators for board ${newBoard._id}`
                );
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

        // Tìm bảng và kiểm tra quyền sở hữu hoặc quyền chỉnh sửa
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
        // kiểm tra user_id có tồn tại không
        const user = await User.findById(user_id);
        if (!user) {
            return sendError(res, 401, "Unauthorized", {
                details: "User is not registered",
            });
        }

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
        logger.info("Board updated successfully");

        // gửi thay đổi về cho các cộng tác viên đang online
        for (let collaborator of board.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "board:allmember:updated", {
                    board: updatedBoard,
                })
            }
        }

        // notyfy các thành viên về sự thay đổi của bảng
        const sendNotiResult = await notify({
            senderId: user_id,
            receiverIds: board.board_collaborators.map(
                (collab) => collab.board_collaborator_id
            ),
            title: "Board updated",
            message: `The board "${board.board_title}" has been updated by ${user.user_full_name}`,
            reference: {
                type: "BOARD",
                id: updatedBoard._id
            },
        });
        if (sendNotiResult !== "OK") {
            logger.error(
                `Failed to notify collaborators for board ${updatedBoard._id}`
            );
        }

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

        const board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Board not found");
        }

        // Kiểm tra quyền sở hữu
        if (String(board.created_by) !== String(user_id)) {
            return sendError(res, 403, "Access Denied", {
                details: "User is not the creator of this board",
            });
        }

        // lấy danh sách id các thành viên
        const collaborators = board.board_collaborators.map(
            (collab) => collab.board_collaborator_id
        );

        const board_title = board.board_title;

        // Xóa bảng
        const deleteResult = await deleteBoard(board_id);
        if (deleteResult.message !== "OK") {
            return sendError(res, 500, "Error deleting board", {
                details: deleteResult.message,
            });
        }

        // gửi thông tin tới client đang online
        for (let collaborator of collaborators) {
            if (onlineUsers.has(collaborator.toString())) {
                const socketId = onlineUsers.get(collaborator.toString());
                await sendToSocket(socketId, "board:allmember:deleted", {
                    board_id: board_id,
                })
            }
        }

        // notify các thành viên về việc xóa bảng
        const sendNotiResult = await notify({
            senderId: user_id,
            receiverIds: collaborators,
            title: "Board deleted",
            message: `The board "${board_title}" has been deleted`,
            reference: {
                type: "BOARD",
                id: board_id,
            },
        });
        if (sendNotiResult !== "OK") {
            logger.error(
                `Failed to notify collaborators for deleted board ${board_id}`
            );
        }
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

        const collaboratorsBeforeAdd = board.board_collaborators.map(
            (collab) => String(collab.board_collaborator_id)
        );

        // Thêm thành viên vào danh sách cộng tác viên
        board.board_collaborators.push({
            board_collaborator_id: member_id,
            board_collaborator_role: member_role,
        });

        // lưu board
        const updatedBoard = await board.save();

        // gửi thông tin member mới tới các cộng tác viên đang online
        for (let collaborator of collaboratorsBeforeAdd) {
            if (onlineUsers.has(collaborator.toString())) {
                const socketId = onlineUsers.get(collaborator.toString());
                await sendToSocket(socketId, "board:allmember:added", {
                    board_id: board_id,
                    member_id: member_id,
                    member_role: member_role
                })
            }
        }

        // gửi thông báo về member mới cho các cộng tác viên đang online
        const sendNotiResultCollaborators = await notify({
            senderId: user_id,
            receiverIds: collaboratorsBeforeAdd,
            title: "New member added to board",
            message: `${member.user_full_name} has been added to the board "${board.board_title}"`,
            reference: {
                type: "BOARD",
                id: board._id,
            },
        });
        if (sendNotiResultCollaborators !== "OK") {
            logger.error(
                `Failed to notify collaborators for new member in board ${board._id}`
            );
        }

        member.user_boards.push({ board_id: board_id, role: "MEMBER" });

        // Lưu thay đổi vào CSDL
        await member.save();

        // gửi thông tin board cho user được thêm vào
        if (onlineUsers.has(member._id.toString())) {
            const socketId = onlineUsers.get(member._id.toString());
            console.log(socketId, "is online");
            await sendToSocket(socketId, "board:member:added", {
                board: updatedBoard,
            })
        }
        // Thông báo về việc member đã được add vào board
        const sendNotiResult = await notify({
            senderId: user_id,
            receiverIds: [member_id],
            title: "You have been added to a board",
            message: `You have been added to the board "${board.board_title}"`,
            reference: {
                type: "BOARD",
                id: updatedBoard._id,
            },
        });
        if (sendNotiResult !== "OK") {
            logger.error(
                `Failed to notify new member for board ${updatedBoard._id}`
            );
        }

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

        // lưu board
        const updatedBoard = await board.save();

        // gửi thông tin member bị xóa tới các cộng tác viên đang online
        for (let collaborator of updatedBoard.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "board:allmember:removed", {
                    board_id: board_id,
                    remove_member_id: member_id,
                })
            }
        }
        // notify các thành viên về việc xóa thành viên
        const sendNotiResult = await notify({
            senderId: user_id,
            receiverIds: board.board_collaborators.map(
                (collab) => collab.board_collaborator_id
            ),
            title: "Member removed from board",
            message: `${member.user_full_name} has been removed from the board "${board.board_title}"`,
            reference: {
                type: "BOARD",
                id: board_id,
            },
        });
        if (sendNotiResult !== "OK") {
            logger.error(
                `Failed to notify collaborators for removed member in board ${board_id}`
            );
        }

        // xóa board khỏi ds của member
        member.user_boards = member.user_boards.filter(
            (board) => String(board.board_id) !== String(board_id)
        );
        // luu member
        await member.save();

        // gửi thông tin remove của member bị xóa
        if (onlineUsers.has(member_id)) {
            const socketId = onlineUsers.get(member_id);
            console.log(socketId, "is online");
            await sendToSocket(socketId, "board:member:removed", {
                board_id: updatedBoard._id,
            })
        }

        // notify member về việc mình bị xóa
        const sendNotiResultMember = await notify({
            senderId: user_id,
            receiverIds: [member_id],
            title: "You have been removed from a board",
            message: `You have been removed from the board "${board.board_title}"`,
            reference: {
                id: board_id,
            },
        });
        if (sendNotiResultMember !== "OK") {
            logger.error(
                `Failed to notify removed member for board ${board_id}`
            );
        }

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

        // gửi thông tin về sự thay đổi role của member tới các member đang online
        for (let collaborator of board.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "board:allmember:role", {
                    board_id: board_id,
                    member_id: member_id,
                    member_role: new_member_role
                })
            }
        }

        // notify thành viên về việc cập nhật vai trò của mình
        const sendNotiResult = await notify({
            senderId: user_id,
            receiverIds: [member_id],
            title: "Member role updated",
            message: `Your role in the board "${board.board_title}" has been updated to ${new_member_role}`,
            reference: {
                type: "BOARD",
                id: updatedBoard._id,
            },
        });
        if (sendNotiResult !== "OK") {
            logger.error(
                `Failed to notify member for role update in board ${updatedBoard._id}`
            );
        }
        logger.info("Member role updated successfully");

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
        const members = await User.find({
            _id: {
                $in: board.board_collaborators.map(
                    (collab) => collab.board_collaborator_id
                ),
            },
        }).select("_id user_full_name user_email user_avatar_url");
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

        // gửi thông tin về trạng thái công khai mới tới các cộng tác viên đang online
        for (let collaborator of updatedBoard.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "board:privacy:updated", {
                    board_id: updatedBoard._id,
                    board_privacy: new_privacy,
                })
            }
        }

        // notify các thành viên về việc cập nhật quyền riêng tư của bảng
        const sendNotiResult = await notify({
            senderId: user_id,
            receiverIds: board.board_collaborators.map(
                (collab) => collab.board_collaborator_id
            ),
            title: "Board privacy updated",
            message: `The privacy of the board "${updatedBoard.board_title}" has been updated to ${new_privacy === true ? "public" : "private"}`,
            reference: {
                type: "BOARD",
                id: updatedBoard._id,
            },
        });
        if (sendNotiResult !== "OK") {
            logger.error(
                `Failed to notify collaborators for privacy update in board ${updatedBoard._id}`
            );
        }

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
        return sendError(res, 500, "Internal Servert Error", {
            details: error.message,
        });
    }
}

async function AddListToBoard(req, res) {
    const { user_id, board_id, list_id } = req.body;
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
        // gửi thông tin list mới tới các cộng tác viên đang online
        for (let collaborator of updatedBoard.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "board:list:added", {
                    list: list
                })
            }
        }

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
        // gửi thông tin list đã được di chuyển tới các cộng tác viên đang online
        for (let collaborator of updatedBoard.board_collaborators) {
            if (onlineUsers.has(collaborator.board_collaborator_id.toString())) {
                const socketId = onlineUsers.get(collaborator.board_collaborator_id.toString());
                await sendToSocket(socketId, "board:list:moved", {
                    board_id: board_id,
                    list_id1: list_id1,
                    list_id2: list_id2,
                })
            }
        }

        return sendSuccess(res, "List moved successfully", updatedBoard);
    } catch (error) {
        logger.error(`Error with MoveList: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

// tùy chọn : lưu
// async function ArchiveBoard(req, res) { }

// async function ChangeBackgroundPicture(req, res) {}

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
