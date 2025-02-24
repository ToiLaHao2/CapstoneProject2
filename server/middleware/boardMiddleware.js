const { validationRules } = require("../utils/validation/validationRules");
const { validateFields } = require("../utils/validation/validate");
const { VerifiedToken } = require("../utils/authHelpers");
const { getTokenFromHeaders } = require("../utils/jwt/getToken");
const logger = require("../utils/logger");
const { sendError } = require("../utils/response");

// Create board
async function validateCreateBoard(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        return sendError(res, 401, "Invalid token", "");
    }
    const boardCreateData = req.body;
    console.log(boardCreateData);
    const rules = validationRules["createBoard"];
    const result = await validateFields(boardCreateData, rules);
    if (result.valid === true) {
        req.body.user_id = checkToken.id;
        logger.info("Successfull checking data to create board");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}

// Get board
async function validateGetBoard(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        return sendError(res, 401, "Invalid token", "");
    }
    const boardGetData = req.body;
    const rules = validationRules["getBoard"];
    const result = await validateFields(boardGetData, rules);
    if (result.valid === true) {
        req.body.user_id = checkToken.id;
        logger.info("Successfull checking data to create board");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}

// Get boards by user id
async function validateGetBoardsByUserId(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        return sendError(res, 401, "Invalid token", "");
    }
    req.body.user_id = checkToken.id;
    const boardsGetByUserId = req.body;
    const rule = validationRules["getBoardsByUserId"];
    const result = await validateFields(boardsGetByUserId, rule);
    if (result.valid === true) {
        logger.info("Successfull checking data to get board by user id");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}

// Update board
async function validateUpdateBoard(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        sendError(res, 401, "Invalid token", "");
    }
    const boardUpdateData = req.body;
    const rules = validationRules["updateBoard"];
    const result = await validateFields(boardUpdateData, rules);
    if (result.valid === true) {
        req.body.user_id = checkToken.id;
        logger.info("Successfull checking data to update board");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}

// Delete board
async function validateDeleteBoard(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        return sendError(res, 401, "Invalid token", "");
    }
    const boardDeleteData = req.body;
    const rules = validationRules["deleteBoard"];
    const result = await validateFields(boardDeleteData, rules);
    if (result.valid === true) {
        req.body.user_id = checkToken.id;
        logger.info("Successfull checking data to delete board");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}

// Add member to board
async function validateAddMember(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        return sendError(res, 401, "Invalid token", "");
    }
    req.body.user_id = checkToken.id;
    const addMemberData = req.body;
    const rules = validationRules["addMemberToBoard"];
    const result = await validateFields(addMemberData, rules);
    if (result.valid === true) {
        req.body.user_id = checkToken.id;
        logger.info("Successfull checking data to add member to board");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}

// Remove member from board
async function validateRemoveMember(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        return sendError(res, 401, "Invalid token", "");
    }
    req.body.user_id = checkToken.id;
    const removeMemberData = req.body;
    const rules = validationRules["removeMemberFromBoard"];
    const result = await validateFields(removeMemberData, rules);
    if (result.valid === true) {
        req.body.user_id = checkToken.id;
        logger.info("Successfull checking data to remove member from board");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}

module.exports = {
    validateCreateBoard,
    validateGetBoard,
    validateUpdateBoard,
    validateDeleteBoard,
    validateGetBoardsByUserId
};
