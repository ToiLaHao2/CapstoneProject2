const { default: mongoose } = require("mongoose");
const Board = require("../models/Board");
const Card = require("../models/Card");
const User = require("../models/User");
const { findByIdOrThrow } = require("../utils/dbHelper");
const logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/response");

async function GetUserProfile(req, res) {
    const { user_id } = req.body;
    try {
        const user = await findByIdOrThrow(User, user_id, {
            errorMessage: "User not found",
        });
        return sendSuccess(res, "Get user data success", user);
    } catch (error) {
        logger.error(error);
        return sendError(res, error.statusCode || 500, error.message, {
            details: error.details || "Error getting user profile",
        });
    }
}

async function UpdateUserProfile(req, res) {
    try {
        const { user_update_details, user_id } = req.body;

        if (
            !user_update_details ||
            Object.keys(user_update_details).length === 0
        ) {
            return sendError(res, 400, "No data to update", {
                details: "No valid fields provided",
            });
        }

        const user = await findByIdOrThrow(User, user_id, {
            errorMessage: "User not found",
        });

        const allowedFields = [
            "user_full_name",
            "user_avatar_url",
            "user_email",
        ];
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

        if (!hasUpdated) {
            return sendError(res, 400, "No fields were updated", {
                details: "Nothing to update, values are the same",
            });
        }

        user.updated_at = Date.now();
        const updatedUser = await user.save();

        return sendSuccess(res, "User updated successfully", updatedUser);
    } catch (error) {
        logger.error(error);
        return sendError(
            res,
            error.statusCode || 500,
            "Internal Server Error",
            {
                details: error.message,
            }
        );
    }
}

// viet kiem tra o upload middleware
async function UploadProfilePicture(req, res) {
    try {
        // kiểm tra nếu có file được tải lên
        if (!req.file) {
            return sendError(res, 400, "No file uploaded", {
                details: "No file was uploaded",
            });
        }

        // lấy url của ảnh từ cloudinary
        const imageUrl = req.file.path;

        // cập nhật url ảnh đại diện vào db của người dùng
        const { user_id } = req.body;
        const user = await findByIdOrThrow(User, user_id, {
            errorMessage: "User not found",
        });

        user.user_avatar_url = imageUrl;
        await user.save();
        return sendSuccess(res, "Profile picture uploaded successfully", user);
    } catch (error) {
        logger.error(error);
        return sendError(
            res,
            error.statusCode || 500,
            "Error uploading profile picture",
            {
                details: error.details || "Unexpected error",
            }
        );
    }
}

// trường hợp lấy tất cả các user trong board với use case của user
// req : user_id, board_id
// đầu tiên tìm board xem có không
// sau đó tìm user xem có không
// sau đó kiểm tra xem user có trong board không
// nếu không trả về lỗi
async function GetAllUserInBoard(req, res) {
    const { user_id, board_id } = req.body;
    try {
        const board = await findByIdOrThrow(Board, board_id, {
            errorMessage: "Board not found",
        });

        if (String.toString(board.created_by) !== String.toString(user_id)) {
            return sendError(res, 401, "Unauthorized", {
                details: "User is not in this board",
            });
        }

        const collaborators = await User.find({
            _id: {
                $in: board.board_collaborators.map(
                    (user) => user.board_collaborator_id
                ),
            },
        }).select("user_full_name");

        return sendSuccess(res, "Get user data success", collaborators);
    } catch (error) {
        logger.error(error);
        return sendError(
            res,
            error.statusCode || 500,
            "Error getting users in board",
            {
                details: error.details || "Unexpected error",
            }
        );
    }
}

// trường hợp thêm user mới vào board với use case của user
// req : user_id, new_user_id, board_id,
// đầu tiên tìm board xem có không
async function AddUserToBoard(req, res) {
    const { user_id, new_user_id, board_id } = req.body;
    try {
        const board = await findByIdOrThrow(Board, board_id, {
            errorMessage: "Board not found",
        });

        if (board.created_by !== user_id) {
            return sendError(res, 401, "Unauthorized", {
                details: "User is not creator of this board",
            });
        }

        const user = await findByIdOrThrow(User, new_user_id, {
            errorMessage: "User not found",
        });

        const isUserInBoard = board.board_collaborators.some(
            (user) => user.board_collaborator_id === new_user_id
        );

        if (isUserInBoard) {
            return sendError(res, 400, "User already in board", {
                details: "User is already in this board",
            });
        }

        board.board_collaborators.push({
            board_collaborator_id: new_user_id,
            board_collaborator_role: "VIEWER",
        });

        await board.save();

        user.user_boards.push({
            board_id: board_id,
            role: "VIEWER",
        });

        await user.save();

        return sendSuccess(res, "User has been added to board", {
            board_id,
            user_id: new_user_id,
        });
    } catch (error) {
        logger.error(error);
        return sendError(
            res,
            error.statusCode || 500,
            "Error adding user to board",
            {
                details: error.details || "Unexpected error",
            }
        );
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

        const board = await findByIdOrThrow(Board, board_id, {
            errorMessage: "Board not found",
        });

        const isUserAdmin = board.board_collaborators.some(
            (collab) =>
                collab.board_collaborator_id === user_id &&
                collab.board_collaborator_role === "ADMIN"
        );

        if (!isUserAdmin) {
            return sendError(res, 401, "Unauthorized", {
                details: "User is not admin of this board",
            });
        }

        const userToRemove = board.board_collaborators.find(
            (collab) => collab.board_collaborator_id === remove_user_id
        );

        if (!userToRemove) {
            return sendError(res, 404, "User not found in board", {
                details: `User with ID ${remove_user_id} is not a member of this board.`,
            });
        }

        board.board_collaborators = board.board_collaborators.filter(
            (collab) => collab.board_collaborator_id !== remove_user_id
        );

        await board.save();

        return sendSuccess(res, "User has been removed from board", {
            board_id,
            removed_user_id: remove_user_id,
        });
    } catch (error) {
        logger.error(error);
        return sendError(
            res,
            error.statusCode || 500,
            "Error removing user from board",
            {
                details: error.details || "Unexpected error",
            }
        );
    }
}

async function UpdateUserRoleInBoard(req, res) { }
// assignUserToCard
async function AssignUserToCard(req, res) { }

// removeUserToCard

// Lấy tất cả các card của user tham gia
// tìm trong tất cả các bảng mà user tham gia
// lấy tất cả các card mà user tham gia
// thông tin chủ yếu lấy là id, title, description, due_date, labels
async function GetAllUserCards(req, res) {
    try {
        const { user_id } = req.body;

        // Convert user_id sang ObjectId
        const objectUserId = new mongoose.Types.ObjectId(user_id);

        const userCards = await Board.aggregate([
            // 1️⃣ Lọc các Board mà user là collaborator hoặc creator
            {
                $match: {
                    $or: [
                        {
                            "board_collaborators.board_collaborator_id":
                                objectUserId,
                        },
                        { created_by: objectUserId },
                    ],
                },
            },
            // 2️⃣ Tách các lists từ board
            { $unwind: "$board_lists" },

            // 3️⃣ Lấy thông tin List tương ứng
            {
                $lookup: {
                    from: "lists",
                    localField: "board_lists.list_id",
                    foreignField: "_id",
                    as: "listData",
                },
            },

            // 4️⃣ Tách từng listData
            { $unwind: "$listData" },

            // 5️⃣ Tách các cards từ list
            { $unwind: "$listData.list_cards" },

            // 6️⃣ Lấy thông tin card tương ứng
            {
                $lookup: {
                    from: "cards",
                    localField: "listData.list_cards.card_id",
                    foreignField: "_id",
                    as: "cardData",
                },
            },

            // 7️⃣ Tách cardData
            { $unwind: "$cardData" },

            // 8️⃣ Lọc những card được assign cho user
            {
                $match: {
                    "cardData.card_assignees.card_assignee_id": objectUserId,
                },
            },

            // 9️⃣ Lấy các trường cần thiết
            {
                $project: {
                    _id: "$cardData._id",
                    card_title: "$cardData.card_title",
                    card_description: "$cardData.card_description",
                    due_date: "$cardData.card_duration",
                    list_id: "$listData._id",
                    board_id: "$_id",
                    created_at: "$cardData.created_at",
                    updated_at: "$cardData.updated_at",
                },
            },
        ]);

        return sendSuccess(res, "User cards retrieved successfully", {
            userCards,
        });
    } catch (error) {
        logger.error(`Error getting user cards: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}
// tìm các cards sắp hết hạn của user
async function GetUserCardsIncoming(req, res) {
    try {
        const { user_id } = req.body;
        const objectUserId = new mongoose.Types.ObjectId(user_id);

        console.log("User ID:", user_id);
        console.log("ObjectId User ID:", objectUserId);

        const userCards = await Board.aggregate([
            // 1️⃣ Lọc các board user tham gia hoặc tạo
            {
                $match: {
                    $or: [
                        {
                            "board_collaborators.board_collaborator_id":
                                objectUserId,
                        },
                        { created_by: objectUserId },
                    ],
                },
            },

            // 2️⃣ Tách từng list trong board
            { $unwind: "$board_lists" },

            // 3️⃣ Join bảng list để lấy listData
            {
                $lookup: {
                    from: "lists",
                    localField: "board_lists.list_id",
                    foreignField: "_id",
                    as: "listData",
                },
            },

            // 4️⃣ Unwind listData
            { $unwind: "$listData" },

            // 5️⃣ Unwind từng card trong list
            { $unwind: "$listData.list_cards" },

            // 6️⃣ Join bảng cards để lấy chi tiết card
            {
                $lookup: {
                    from: "cards",
                    localField: "listData.list_cards.card_id",
                    foreignField: "_id",
                    as: "cardData",
                },
            },

            // 7️⃣ Unwind cardData
            { $unwind: "$cardData" },

            // 8️⃣ Lọc những card có assignee là user và due_date còn hạn
            {
                $match: {
                    "cardData.card_assignees.card_assignee_id": objectUserId,
                    "cardData.card_duration": { $gte: new Date() },
                },
            },

            // 9️⃣ Chọn các trường cần trả về
            {
                $project: {
                    _id: "$cardData._id",
                    card_title: "$cardData.card_title",
                    card_description: "$cardData.card_description",
                    due_date: "$cardData.card_duration",
                    list_id: "$listData._id",
                    board_id: "$_id",
                    created_at: "$cardData.created_at",
                    updated_at: "$cardData.updated_at",
                },
            },
        ]);

        console.log("User Cards from DB:", userCards);

        return sendSuccess(res, "User cards incoming retrieved successfully", {
            userCards,
        });
    } catch (error) {
        logger.error(`Error getting user cards incoming: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            error: error.message,
        });
    }
}

// Tìm kiếm user theo user_full_name
async function SearchUsers(req, res) {
    try {
        const { search_string } = req.body;
        // lấy tất cả các thông tin user theo search_string nhưng không có user có id là user_id
        const users = await User.find({
            $and: [
                { user_full_name: { $regex: search_string, $options: "i" } },
                { _id: { $ne: req.body.user_id } },
            ],
        }).select("user_full_name user_email user_avatar_url");
        return sendSuccess(res, "Users found", { users });
    } catch (error) {
        logger.error(`Error searching users: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

// idea: gợi ý user để thêm vào board
// dựa trên các bảng mà user đã tham gia
// lấy thông tin tất cả các user đã tham gia các bảng mà user đã tham gia
async function SuggestUsersToAdd(req, res) {
    try {
        const { user_id } = req.body;
        const user = await findByIdOrThrow(User, user_id, {
            errorMessage: "User not found",
        });

        const userBoards = user.user_boards.map((board) => board.board_id);

        const users = await User.find({
            _id: { $ne: user_id },
            user_boards: { $elemMatch: { board_id: { $in: userBoards } } },
        }).select("user_full_name user_email user_avatar_url");
        return sendSuccess(res, "Users suggested", { users });
    } catch (error) {
        logger.error(`Error suggesting users: ${error}`);
        return sendError(res, 500, "Internal Server Error", {
            details: error.message,
        });
    }
}

async function UpdateNotificationsSettings(req, res) { }

async function GetUserNotifications(req, res) { }

// Tạo nhóm làm việc chung
async function CreateWorkGroup(req, res) { }

module.exports = {
    GetUserProfile,
    UpdateUserProfile,
    GetAllUserInBoard,
    AddUserToBoard,
    RemoveUserFromBoard,
    GetAllUserCards,
    GetUserCardsIncoming,
    SearchUsers,
    SuggestUsersToAdd,
};