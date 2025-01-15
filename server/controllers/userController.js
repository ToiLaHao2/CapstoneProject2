const Board = require("../models/Board");
const User = require("../models/User");
const logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/response");

async function GetUserProfile(req, res) {
    const { user_id } = req.body;
    try {
        let user = await User.findById(user_id);
        if (!user) {
            return sendError(res, 401, "Unauthorized", {
                details: "User is not registered"
            });
        } else {
            return sendSuccess(res, "Get user data success", user);
        }
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Error getting user profile", error);
    }
}

async function UpdateUserProfile(req, res) {
    try {
        const { user_update_details, user_id } = req.body;

        // Kiểm tra object user_update_details có rỗng không
        if (
            !user_update_details ||
            Object.keys(user_update_details).length === 0
        ) {
            return sendError(res, 400, "No data to update", {
                details: "No valid fields provided"
            });
        }

        // Tìm user
        const user = await User.findById(user_id);

        if (!user) {
            return sendError(res, 404, "User not found", {
                details: "User not registered yet"
            });
        }

        // Chỉ cập nhật các trường hợp lệ
        const allowedFields = [
            "user_full_name",
            "user_avatar_url",
            "user_email"
        ];

        // Cập nhật các trường hợp lệ
        let hasUpdated = false;

        for (const key in user_update_details) {
            if (
                allowedFields.includes(key) &&
                user[key] !== user_update_details[key]
            ) {
                user[key] = user_update_details[key];
                hasUpdated = true;
            }
        }

        // Nếu không có thay đổi, trả về lỗi
        if (!hasUpdated) {
            return sendError(res, 400, "No fields were updated", {
                details: "Nothing to update, values are the same"
            });
        }

        user.updated_at = Date.now();

        // Lưu thay đổi vào CSDL
        const updatedUser = await user.save();

        // Trả về thành công
        return sendSuccess(res, "User updated successfully", updatedUser);
    } catch (error) {
        logger.error(`Error with UpdateUser: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message
        });
    }
}

async function UploadProfilePicture(req, res) {}

// trường hợp lấy tất cả các user trong board với use case của user
// req : user_id, board_id
// đầu tiên tìm board xem có không
// sau đó tìm user xem có không
// sau đó kiểm tra xem user có trong board không
// nếu không trả về lỗi
async function GetAllUserInBoard(req, res) {
    const { user_id, board_id } = req.body;
    try {
        let board = await Board.findById(board_id);
        if (!board) {
            return sendError(res, 404, "Undefinded", {
                details: "Board is not found"
            });
        } else {
            let user = board.board_collaborators.find(
                user => user.board_collaborator_id === user_id
            );
            if (!user) {
                return sendError(res, 401, "Unauthorized", {
                    details: "User is not in this board"
                });
            }
            const colaborators = await User.find({
                _id: {
                    $in: board.board_collaborators.map(
                        user => user.board_collaborator_id
                    )
                }
            }).select("user_full_name");
            return sendSuccess(res, "Get user data success", colaborators);
        }
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Error getting user profile", error);
    }
}

// trường hợp thêm user mới vào board với use case của user
// req : user_id, new_user_id, board_id,
// đầu tiên tìm board xem có không
async function AddUserToBoard(req, res) {
    const { user_id, new_user_id, board_id } = req.body;
    try {
        let user = await User.findById(user_id);
        if (!user) {
            return sendError(res, 404, "Undefinded", {
                details: "User is not found"
            });
        }
        let board = user.user_boards.find(board => board.board_id === board_id);
        if (!board) {
            return sendError(res, 404, "Undefinded", {
                details: "User is not in this board"
            });
        }
        if (board.role !== "ADMIN") {
            return sendError(res, 401, "Unauthorized", {
                details: "User is not admin of this board"
            });
        }
        let boardGet = await Board.findById(board.board_id);
        if (!boardGet) {
            return sendError(res, 404, "Undefinded", {
                details: "Board is not found"
            });
        }
        let userAddCheck = await User.findById(new_user_id);
        if (!userAddCheck) {
            return sendError(res, 404, "Undefinded", {
                details: "User is not found"
            });
        }
        let isAlreadyMember = boardGet.board_collaborators.some(
            collab => collab.board_collaborator_id === new_user_id
        );
        if (isAlreadyMember) {
            return sendError(res, 400, "User already exists in board");
        }
        boardGet.board_collaborators.push({
            board_collaborator_id: new_user_id,
            board_collaborator_role: "VIEWER"
        });
        await boardGet.save();
        return sendSuccess(res, {
            message: "User has been added to board",
            data: "User has been added to board"
        });
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Error getting user profile", error);
    }
}
// trường hợp xóa user khỏi board với use case của user
// req : user_id, remove_user_id, board_id,
// đầu tiên tìm board xem có không
async function RemoveUserFromBoard(req, res) {
    const { user_id, remove_user_id, board_id } = req.body;
    try {
        if (remove_user_id === user_id) {
            return sendError(res, 400, "Cannot remove yourself from board");
        }
        let user = await User.findById(user_id);
        if (!user) {
            return sendError(res, 404, "Undefinded", {
                details: "User is not found"
            });
        }
        let board = user.user_boards.find(board => board.board_id === board_id);
        if (!board) {
            return sendError(res, 404, "Undefinded", {
                details: "User is not in this board"
            });
        }
        if (board.role !== "ADMIN") {
            return sendError(res, 401, "Unauthorized", {
                details: "User is not admin of this board"
            });
        }
        let boardGet = await Board.findById(board.board_id);
        if (!boardGet) {
            return sendError(res, 404, "Undefinded", {
                details: "Board is not found"
            });
        }
        let userRemove = boardGet.board_collaborators.find(
            user => user.board_collaborator_id === remove_user_id
        );
        if (!userRemove) {
            return sendError(res, 404, "User not found in board", {
                details: `User with ID ${remove_user_id} is not a member of this board.`
            });
        }
        boardGet.board_collaborators = boardGet.board_collaborators.filter(
            user => user.board_collaborator_id !== remove_user_id
        );
        await boardGet.save();
        return sendSuccess(res, {
            message: "User has been removed from board",
            data: "User has been removed from board"
        });
    } catch (error) {
        logger.error(error);
        return sendError(res, 500, "Error getting user profile", error);
    }
}

async function UpdateUserRoleInBoard(params) {}

async function AssignUserToBoard(params) {}

// Lấy tất cả các card của user tham gia
async function GetUserCards(params) {}

async function SearchUsers(params) {}

async function SuggestUsersToAdd(params) {}

async function UpdateNotificationsSettings(params) {}

async function GetUserNotifications(params) {}

// Tạo nhóm làm việc chung
async function CreateWorkGroup(params) {}

module.exports = { GetUserProfile, UpdateUserProfile };
