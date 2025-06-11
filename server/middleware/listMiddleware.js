const { validationRules } = require("../utils/validation/validationRules");
const { validateFields } = require("../utils/validation/validate");
const { VerifiedToken } = require("../utils/authHelpers");
const { getTokenFromHeaders } = require("../utils/jwt/getToken");
const logger = require("../utils/logger");
const { sendError } = require("../utils/response");
// create list
async function validateCreateList(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        logger.info("Invalid token in create list");
        return sendError(res, 401, "Invalid token", "");
    }
    req.body.user_id = checkToken.id;
    const createListData = req.body;
    const rules = validationRules["createList"];
    const result = await validateFields(createListData, rules);
    if (result.valid === true) {
        logger.info("Successfull checking data to create list");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}
// get list
async function validateGetList(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        logger.info("Invalid token in get list");
        return sendError(res, 401, "Invalid token", "");
    }
    req.body.user_id = checkToken.id;
    const getListData = req.body;
    const rules = validationRules["getList"];
    const result = await validateFields(getListData, rules);
    if (result.valid === true) {
        logger.info("Successfull checking data to get list");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}
// update list
async function validateUpdateList(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        logger.info("Invalid token in update list");
        return sendError(res, 401, "Invalid token", "");
    }
    req.body.user_id = checkToken.id;
    const updateListData = req.body;
    const rules = validationRules["updateList"];
    const result = await validateFields(updateListData, rules);
    if (result.valid === true) {
        logger.info("Successfull checking data to update list");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}
// delete list
async function validateDeleteList(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        logger.info("Invalid token in delete list");
        return sendError(res, 401, "Invalid token", "");
    }
    req.body.user_id = checkToken.id;
    const deleteListData = req.body;
    const rules = validationRules["deleteList"];
    const result = await validateFields(deleteListData, rules);
    if (result.valid === true) {
        logger.info("Successfull checking data to delete list");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}
// get cards in list
async function validateGetCardsInList(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        logger.info("Invalid token in get cards in list");
        return sendError(res, 401, "Invalid token", "");
    }
    req.body.user_id = checkToken.id;
    const getCardsInListData = req.body;
    const rules = validationRules["getCardsInList"];
    const result = await validateFields(getCardsInListData, rules);
    if (result.valid === true) {
        logger.info("Successfull checking data to get cards in list");
        next();
    } else {
        logger.info(`Error checking data ${result.error}`);
        return sendError(res, 400, `Error checking data ${result.error}`);
    }
}

module.exports = {
    validateCreateList,
    validateGetList,
    validateUpdateList,
    validateDeleteList,
    validateGetCardsInList,
};
