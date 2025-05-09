const validationRules = {
    //Auth middleware validate
    register: {
        checkMessage: "Register new account",
        requiredFields: [
            "user_full_name",
            "user_email",
            "user_password",
            "user_avatar_url",
            "checkMessage",
        ],
        minLength: {
            user_name: 3,
            user_password: 6,
        },
        maxLength: {
            user_phone: 10,
        },
        regex: {
            user_email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
    },
    login: {
        checkMessage: "Login to account",
        requiredFields: ["user_email", "user_password", "checkMessage"],
    },
    changePassword: {
        checkMessage: "Change password",
        requiredFields: [
            "user_email",
            "user_password",
            "user_last_password",
            "checkMessage",
        ],
        minLength: {
            user_password: 6,
        },
    },
    validateUpload: {
        checkMessage: "Upload avatar",
        requiredFields: ["user_id", "file", "checkMessage"],
        fileSize: 5 * 1024 * 1024, // Giới hạn file tối đa 5MB
        allowedMimeTypes: [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/zip",
            "application/x-rar-compressed",
        ],
        fileCategory: {
            avatar: ["image/jpeg", "image/png", "image/jpg"],
            compressed: ["application/zip", "application/x-rar-compressed"],
        },
    },
    // User middle validate
    // getUserProfile
    getUserProfile: {
        checkMessage: "Get user profile",
        requiredFields: ["user_id", "checkMessage"],
    },
    // updateUser
    updateUserProfile: {
        checkMessage: "Update user profile",
        requiredFields: ["user_id", "user_update_details", "checkMessage"],
    },
    // uploadProfilePicture
    // getAllUserInBoard
    getAllUserInBoard: {
        checkMessage: "Get all user in board",
        requiredFields: ["board_id", "user_id", "checkMessage"],
    },
    // addUserToBoard
    addUserToBoard: {
        checkMessage: "Add user to board",
        requiredFields: ["board_id", "user_id", "new_user_id", "checkMessage"],
    },
    // removeUserFromBoard
    removeUserFromBoard: {
        checkMessage: "Remove user from board",
        requiredFields: [
            "board_id",
            "user_id",
            "remove_user_id",
            "checkMessage",
        ],
    },
    // updateUserRoleInBoard
    // assignUserToCard
    // removeUserToCard
    // getAllUserCards
    getAllUserCards: {
        checkMessage: "Get user cards",
        requiredFields: ["user_id", "checkMessage"],
    },
    // getUserCardsIncoming
    getUserCardsIncoming: {
        checkMessage: "Get user cards incoming",
        requiredFields: ["user_id", "checkMessage"],
    },
    // searchUsers
    searchUsers: {
        checkMessage: "Search users",
        requiredFields: ["user_id", "search_string", "checkMessage"],
    },
    // suggestUsersToAdd
    suggestUsersToAdd: {
        checkMessage: "Suggest users to add",
        requiredFields: ["user_id", "checkMessage"],
    },
    // updateNotificationsSettings
    // getUserNotifications
    // creatWorkGroup(đang xem xét)

    inviteUserToBoardByEmail: {
        checkMessage: "Invite user to board by email",
        requiredFields: ["board_id", "user_email", "checkMessage"],
    },
    // Board middleware validate
    // createBoard
    createBoard: {
        checkMessage: "Create new board",
        requiredFields: [
            "board_title",
            "board_description",
            "board_is_public",
            "board_collaborators",
            "board_list",
            "checkMessage",
        ],
        maxLength: {
            board_description: 500,
        },
    },
    // getBoard
    getBoard: {
        checkMessage: "Get board",
        requiredFields: ["board_id", "checkMessage"],
    },
    // getBoardsByUserId
    getBoardsByUserId: {
        checkMessage: "Get boards by user id",
        requiredFields: ["user_id", "checkMessage"],
    },
    // updateBoard
    updateBoard: {
        checkMessage: "Update board",
        requiredFields: ["board_id", "board_update_details", "checkMessage"],
    },
    // deleteBoard
    deleteBoard: {
        checkMessage: "Delete board",
        requiredFields: ["board_id", "checkMessage"],
    },
    // addMemberToBoard
    addMemberToBoard: {
        checkMessage: "Add member to board",
        requiredFields: [
            "user_id",
            "board_id",
            "member_id",
            "member_role",
            "checkMessage",
        ],
    },
    // removeMemberFromBoard
    removeMemberFromBoard: {
        checkMessage: "Remove member from board",
        requiredFields: ["user_id", "board_id", "member_id", "checkMessage"],
    },
    // updateMemberRole
    updateMemberRole: {
        checkMessage: "Update member role",
        requiredFields: [
            "user_id",
            "board_id",
            "member_id",
            "new_member_role",
            "checkMessage",
        ],
    },
    // getAllMembers
    getAllMembers: {
        checkMessage: "Get all members",
        requiredFields: ["user_id", "board_id", "checkMessage"],
    },
    // updatePrivacy
    updatePrivacy: {
        checkMessage: "Update privacy",
        requiredFields: ["user_id", "board_id", "new_privacy", "checkMessage"],
    },
    // checkUserAccess
    checkUserAccess: {
        checkMessage: "Check user access",
        requiredFields: ["user_id", "board_id", "checkMessage"],
    },
    // getListsInBoard
    getListsInBoard: {
        checkMessage: "Get lists in board",
        requiredFields: ["user_id", "board_id", "checkMessage"],
    },
    // addListToBoard
    addListToBoard: {
        checkMessage: "Add list to board",
        requiredFields: ["user_id", "board_id", "list_id", "checkMessage"],
    },
    // moveList
    moveList: {
        checkMessage: "Move list",
        requiredFields: [
            "user_id",
            "board_id",
            "list_id1",
            "list_id2",
            "checkMessage",
        ],
    },
    // getCardsInBoard
    // archiveCard
    // updateBoardSetting
    // assignLabelsToBoard

    // List middleware validate
    // createList
    createList: {
        checkMessage: "Create new list",
        requiredFields: ["user_id", "board_id", "list_title", "checkMessage"],
    },
    // getList
    getList: {
        checkMessage: "Get list",
        requiredFields: ["user_id", "board_id", "list_id", "checkMessage"],
    },
    // updateList
    updateList: {
        checkMessage: "Update list",
        requiredFields: [
            "user_id",
            "board_id",
            "list_id",
            "list_title",
            "checkMessage",
        ],
    },
    // deleteList
    deleteList: {
        checkMessage: "Delete list",
        requiredFields: ["user_id", "board_id", "list_id", "checkMessage"],
    },
    // addCardToList
    addCardToList: {
        checkMessage: "Add card to list",
        requiredFields: [
            "user_id",
            "board_id",
            "list_id",
            "card_id",
            "checkMessage",
        ],
    },
    // moveCard
    moveCardListUseCase: {
        checkMessage: "Move card",
        requiredFields: [
            "user_id",
            "board_id",
            "list_id",
            "card_id1",
            "card_id2",
            "checkMessage",
        ],
    },
    // getCardsInList
    getCardsInList: {
        checkMessage: "Get cards in list",
        requiredFields: ["user_id", "board_id", "list_id", "checkMessage"],
    },
    // moveCardsInList
    // moveCardToOtherList

    // Card middleware validate
    // createCard
    createCard: {
        checkMessage: "Create new card",
        requiredFields: [
            "user_id",
            "board_id",
            "list_id",
            "card_title",
            "card_duration",
            "card_description",
            "checkMessage",
        ],
    },
    // getCard
    getCard: {
        checkMessage: "Get card",
        requiredFields: [
            "user_id",
            "board_id",
            "list_id",
            "card_id",
            "checkMessage",
        ],
    },
    // updateCard
    updateCard: {
        checkMessage: "Update card",
        requiredFields: [
            "user_id",
            "board_id",
            "list_id",
            "card_id",
            "card_update_details",
            "checkMessage",
        ],
    },
    // deleteCard
    // moveCard
    moveCardBetweenListCardUseCase: {
        checkMessage: "Move card",
        requiredFields: [
            "user_id",
            "board_id",
            "old_list_id",
            "new_list_id",
            "card_id",
            "checkMessage",
        ],
    },
    // assignUserToCard
    assignUserToCard: {
        checkMessage: "Assign user to card",
        requiredFields: [
            "user_id",
            "board_id",
            "list_id",
            "card_id",
            "assign_user_id",
            "checkMessage",
        ],
    },
    // removeUserFromCard
    removeUserFromCard: {
        checkMessage: "Remove user from card",
        requiredFields: [
            "user_id",
            "board_id",
            "list_id",
            "card_id",
            "remove_user_id",
            "checkMessage",
        ],
    },
    // addAttachmentToCard
    // addCommentToCard
    // getCommentsInCard
    // assignLabelToCard
    // archiveCard
    // updateCheckListsInCard
};

module.exports = { validationRules };
