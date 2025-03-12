const { validationRules } = require("../utils/validation/validationRules");
const { validateFields } = require("../utils/validation/validate");
const { VerifiedToken } = require("../utils/authHelpers");
const { getTokenFromHeaders } = require("../utils/jwt/getToken");
const logger = require("../utils/logger");
const { sendError } = require("../utils/response");

// get user profile
async function validateGetUserProfile(req, res, next) {
  const token = await getTokenFromHeaders(req);
  const checkToken = await VerifiedToken(token);
  if (!checkToken) {
    logger.info("Invalid token in get user profile");
    return sendError(res, 401, "Invalid token", "");
  }
  req.body.user_id = checkToken.id;
  const userRequestGetProfile = req.body;
  const rules = validationRules["getUserProfile"];
  const resultCheckingData = await validateFields(userRequestGetProfile, rules);
  if (resultCheckingData.valid === true) {
    logger.info("Successfull checking data user for get user profile");
    next();
  } else {
    logger.info(
      `Error checking data user for get user profile: ${resultCheckingData.error}`
    );
    return sendError(res, 400, "Error checking data", {
      Error: resultCheckingData.error,
    });
  }
}

// update user profile
async function validateUpdateUserProfile(req, res, next) {
  const token = await getTokenFromHeaders(req);
  const checkToken = await VerifiedToken(token);
  if (!checkToken) {
    logger.info("Invalid token in update user profile");
    return sendError(res, 401, "Invalid token", "");
  }
  req.body.user_id = checkToken.id;
  const userRequestUpdateProfile = req.body;
  const rules = validationRules["updateUserProfile"];
  const resultCheckingData = await validateFields(
    userRequestUpdateProfile,
    rules
  );
  if (resultCheckingData.valid === true) {
    logger.info("Successfull checking data user for update profile");
    next();
  } else {
    logger.info(
      `Error checking data user for updating: ${resultCheckingData.error}`
    );
    return sendError(res, 400, "Error checking data", {
      Error: resultCheckingData.error,
    });
  }
}

// get all user in board
async function validateGetAllUserInBoard(req, res, next) {
  const token = await getTokenFromHeaders(req);
  const checkToken = await VerifiedToken(token);
  if (!checkToken) {
    logger.info("Invalid token in get all user in board");
    return sendError(res, 401, "Invalid token", "");
  }
  req.body.user_id = checkToken.id;
  const userRequestGetAllUserInBoard = req.body;
  const rules = validationRules["getAllUserInBoard"];
  const resultCheckingData = await validateFields(userRequestGetAllUserInBoard, rules);
  if (resultCheckingData.valid === true) {
    logger.info("Successfull checking data user for get user profile");
    next();
  } else {
    logger.info(
      `Error checking data user for get user profile: ${resultCheckingData.error}`
    );
    return sendError(res, 400, "Error checking data", {
      Error: resultCheckingData.error,
    });
  }
}

// add user to board
async function validateAddUserToBoard(req, res, next) {
  const token = await getTokenFromHeaders(req);
  const checkToken = await VerifiedToken(token);
  if (!checkToken) {
    logger.info("Invalid token in add user to board");
    return sendError(res, 401, "Invalid token", "");
  }
  req.body.user_id = checkToken.id;
  const userRequestAddUserToBoard = req.body;
  const rules = validationRules["addUserToBoard"];
  const resultCheckingData = await validateFields(userRequestAddUserToBoard, rules);
  if (resultCheckingData.valid === true) {
    logger.info("Successfull checking data user for get user profile");
    next();
  } else {
    logger.info(
      `Error checking data user for get user profile: ${resultCheckingData.error}`
    );
    return sendError(res, 400, "Error checking data", {
      Error: resultCheckingData.error,
    });
  }
}

// remove user from board
async function validateRemoveUserFromBoard(req, res, next) {
  const token = await getTokenFromHeaders(req);
  const checkToken = await VerifiedToken(token);
  if (!checkToken) {
    logger.info("Invalid token in remove user from board");
    return sendError(res, 401, "Invalid token", "");
  }
  req.body.user_id = checkToken.id;
  const userRequestRemoveUserFromBoard = req.body;
  const rules = validationRules["removeUserFromBoard"];
  const resultCheckingData = await validateFields(userRequestRemoveUserFromBoard, rules);
  if (resultCheckingData.valid === true) {
    logger.info("Successfull checking data user for get user profile");
    next();
  } else {
    logger.info(
      `Error checking data user for get user profile: ${resultCheckingData.error}`
    );
    return sendError(res, 400, "Error checking data", {
      Error: resultCheckingData.error,
    });
  }
}

// update user role in board
async function validateUpdateUserRoleInBoard(req, res, next) {
  const token = await getTokenFromHeaders(req);
  const checkToken = await VerifiedToken(token);
  if (!checkToken) {
    logger.info("Invalid token in update user role in board");
    return sendError(res, 401, "Invalid token", "");
  }
  req.body.user_id = checkToken.id;
  const userRequestUpdateUserRoleInBoard = req.body;
  const rules = validationRules["updateMemberRoleInBoard"];
  const resultCheckingData = await validateFields(userRequestUpdateUserRoleInBoard, rules);
  if (resultCheckingData.valid === true) {
    logger.info("Successfull checking data user for get user profile");
    next();
  } else {
    logger.info(`Error checking data user for get user profile: ${resultCheckingData.error}`);
      return sendError(res, 400, "Error checking data", {Error: resultCheckingData.error,});
  }
}

// update

module.exports = { validateGetUserProfile, validateUpdateUserProfile, validateGetAllUserInBoard, validateAddUserToBoard, validateRemoveUserFromBoard, validateUpdateUserRoleInBoard };
