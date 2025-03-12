const { validationRules } = require("../utils/validation/validationRules");
const { validateFields } = require("../utils/validation/validate");
const { VerifiedToken } = require("../utils/authHelpers");
const { getTokenFromHeaders } = require("../utils/jwt/getToken");
const logger = require("../utils/logger");
const { sendError } = require("../utils/response");

// create card
async function validateCreateCard(req,res,next){
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if(!checkToken){
        logger.error("Invalid token");
        return sendError(res,401, "Invalid token","");
    }
    req.body.user_id = checkToken.id;
    const cardCreateData = req.body;
    const rules = validationRules["createCard"];
    const result = await validateFields(cardCreateData,rules);
    if(!result.valid){
        logger.error(`Error checking data ${result.error}`);
        return sendError(res,400,"Invalid data",result.error);
    } else {
        logger.info("Successfull checking data to create card");
        next();
    }
}
// get card
async function validateGetCard(req,res,next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if(!checkToken){
        logger.error("Invalid token");
        return sendError(res,401,"Invalid token","");
    }
    req.body.user_id = checkToken.id;
    const cardGetData = req.body;
    const rules = validationRules["getCard"];
    const result = await validateFields(cardGetData,rules);
    if(!result.valid){
        logger.error(`Error checking data ${result.error}`)
        return sendError(res,400,"Invalid data", result.error);
    } else {
        logger.info("Successfull checking data to get cardd");
        next();
    }
}
// update card
async function validateUpdateCard(req,res,next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        logger.error("Invalid token")
        return sendError(res,401,"Invalid token","");
    }
    req.body.user_id = checkToken.id;
    const cardUpdateData = req.body;
    const rules = validationRules["updateCard"];
    const result = await validateFields(cardUpdateData,rules);
    if (!result.valid) {
        logger.error(`Error checking data ${result.error}`);
        return sendError(res,400,"Invalid data", result.error);
    } else {
        logger.info("Successfull checking data to update card");
        next();
    }
}
// delete card
// move card
async function validateMoveCard(req,res,next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        logger.error("Invalid token");
        return sendError(res,401,"Invalid token","");
    }
    req.body.user_id = checkToken.id;
    const cardMoveData = req.body;
    const rules = validationRules["moveCardBetweenListCardUseCase"];
    const result = await validateFields(cardMoveData,rules);
    if (!result.valid) {
        logger.error(`Error checking data ${result.error}`);
        return sendError(res,400,"Invalid data", result.error);
    } else {
        logger.info("Successfull checking data to move card in list");
        next();
    }
}
// assign user to card
async function validateAssignUserToCard(req,res,next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        logger.error("Invalid token");
        return sendError(res,401,"Invalid token","");
    }
    req.body.user_id = checkToken.id;
    const cardAssignUserData = req.body;
    const rules = validationRules["assignUserToCard"];
    const result = await validateFields(cardAssignUserData,rules);
    if (!result.valid) {
        logger.error(`Error checking data ${result.error}`);
        return sendError(res,400,"Invalid data", result.error);
    } else {
        logger.info("Successfull checking data to assign user to card");
        next();
    }
}
// remove user from card
async function validateRemoveUserFromCard(req,res,next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        logger.error("Invalid token");
        return sendError(res,401,"Invalid token","");
    }
    req.body.user_id = checkToken.id;
    const cardRemoveUserData = req.body;
    const rules = validationRules["removeUserFromCard"];
    const result = await validateFields(cardRemoveUserData,rules);
    if (!result.valid) {
        logger.error(`Error checking data ${result.error}`);
        return sendError(res,400,"Invalid data", result.error);
    } else {
        logger.info("Successfull checking data to remove user from card");
        next();
    }
}

module.exports = {
    validateCreateCard,
    validateGetCard,
    validateUpdateCard,
    validateMoveCard,
    validateAssignUserToCard,
    validateRemoveUserFromCard
};