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
    return res.status(401).json({ error: "Invalid token" });
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
    return res.status(401).json({ error: "Invalid token" });
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

module.exports = { validateGetUserProfile, validateUpdateUserProfile };
