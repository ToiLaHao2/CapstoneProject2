// middleware/cardMiddleware.js
// -----------------------------------------------------------------------------
// Validation middleware dành riêng cho Card APIs (create, update, move, attach...)
// -----------------------------------------------------------------------------
// Cách dùng:
//   const { validateCreateCard, validateMoveCard, ... } = require('../middleware/cardMiddleware');
// -----------------------------------------------------------------------------

const { validationRules } = require('../utils/validation/validationRules');
const { validateFields } = require('../utils/validation/validate');
const { VerifiedToken } = require('../utils/authHelpers');
const { getTokenFromHeaders } = require('../utils/jwt/getToken');
const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

function validator(ruleName) {
    return async (req, res, next) => {
        try {
            const token = getTokenFromHeaders(req);
            const decoded = await VerifiedToken(token);
            if (!decoded) {
                logger.error(`[validate ${ruleName}] invalid token`);
                return sendError(res, 401, 'Invalid token');
            }
            req.body.user_id = decoded.id;

            const rules = validationRules[ruleName];
            const { valid, error } = await validateFields(req.body, rules);
            if (!valid) {
                logger.error(`[validate ${ruleName}] ${error}`);
                return sendError(res, 400, 'Invalid data', { error });
            }
            logger.info(`[validate ${ruleName}] ok`);
            next();
        } catch (err) {
            logger.error(`[validate ${ruleName}]`, err);
            return sendError(res, 500, 'Internal Server Error');
        }
    };
}

// ------------------------------ Conversation ---------------------------------------
const validateCreateConversation = validator('createConversation');
const validateAddMessageToConversation = validator('addMessageToConversation');
const validateGetConversation = validator('getConversation');
const validateAddParticipantToConversation = validator('addParticipantToConversation');
const validateRemoveParticipantFromConversation = validator('removeParticipantFromConversation');
const validateGetConversationsByUser = validator('getConversationsByUser');

// ---------------------------------------------------------------------------
module.exports = {
    validateCreateConversation,
    validateAddMessageToConversation,
    validateGetConversation,
    validateAddParticipantToConversation,
    validateRemoveParticipantFromConversation,
    validateGetConversationsByUser
}

