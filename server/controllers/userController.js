const User = require("../models/User");
const logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/response");

async function GetUserProfile(req, res) {
  const reqGetProfile = req.body;
  try {
    let user = await User.findById(reqGetProfile.user_id);
    if (!user) {
      return sendError(res, 401, "Unauthorized", {
        details: "User is not registered",
      });
    } else {
      return sendSuccess(res, "Get user data success", user);
    }
  } catch (error) {
    return sendError(res, 500, "Error getting user profile", error);
  }
}

module.exports = { GetUserProfile };
