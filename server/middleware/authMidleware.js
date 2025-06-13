const { validationRules } = require("../utils/validation/validationRules");
const { validateFields } = require("../utils/validation/validate");
const { VerifiedToken } = require("../utils/authHelpers");
const { getTokenFromHeaders } = require("../utils/jwt/getToken");
const logger = require("../utils/logger");
const { sendError } = require("../utils/response");

async function validateRegister(req, res, next) {
    const userRegist = req.body;
    const rules = validationRules["register"];
    const resultCheckingData = await validateFields(userRegist, rules);
    if (resultCheckingData.valid === true) {
        logger.info("Successfull checking data register new user");
        next();
    } else {
        logger.info(
            `Error checking data register new user: ${resultCheckingData.error}`
        );
        return sendError(res, 400, "Error checking data", {
            Error: resultCheckingData.error,
        });
    }
}

async function validateLogin(req, res, next) {
    const userLogin = req.body;
    const rules = validationRules["login"];
    const resultCheckingData = await validateFields(userLogin, rules);
    if (resultCheckingData.valid === true) {
        logger.info("Successfull checking data user for login");
        next();
    } else {
        logger.info(
            `Error checking data user for login: ${resultCheckingData.error}`
        );
        return sendError(res, 400, "Error checking data", {
            Error: resultCheckingData.error,
        });
    }
}

async function validationChangePassword(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        return sendError(res, 401, "Invalid token");
    }
    const userRequestChangePassword = req.body;
    const rules = validationRules["changePassword"];
    const resultCheckingData = await validateFields(
        userRequestChangePassword,
        rules
    );
    if (resultCheckingData.valid === true) {
        logger.info("Successfull checking data user for changing password");
        next();
    } else {
        logger.info(
            `Error checking data user for changing password: ${resultCheckingData.error}`
        );
        return sendError(res, 400, "Error checking data", {
            Error: resultCheckingData.error,
        });
    }
}

async function validateLogout(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        return sendError(res, 401, "Invalid token");
    }
    req.user_id = checkToken.id;
    next();
}

module.exports = { validateRegister, validateLogin, validationChangePassword, validateLogout };
