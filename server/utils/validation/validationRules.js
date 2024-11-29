const validationRules = {
  //Auth validate
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
  // Board validate
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
  updateBoard: {
    checkMessage: "Update board",
  },
  deleteBoard: {
    checkMessage: "Delete board",
  },
};

module.exports = { validationRules };
