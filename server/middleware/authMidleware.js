const { validationRules }= require("../utils/validation/validationRules");
const { validateFields } = require("../utils/validation/validate");
const { VerifiedToken } = require("../utils/authHelpers");
const { getTokenFromHeaders } = require("../utils/jwt/getToken");
const logger = require("../utils/logger");

async function validateRegister(req, res, next) {
    const userRegist = req.body;
    const rules = validationRules["register"];
    const resultCheckingData = await validateFields(userRegist, rules);
    if (resultCheckingData.valid == true) {
        logger.info("Successfull checking data register new user");
        next();
    } else {
        logger.info(
            `Error checking data register new user: ${resultCheckingData.error}`
        );
        res.status(400).json(resultCheckingData.error);
    }
}

async function validateLogin(req, res, next) {
    const userLogin = req.body;
    const rules = validationRules["login"];
    const resultCheckingData = await validateFields(userLogin, rules);
    if (resultCheckingData.valid == true) {
        logger.info("Successfull checking data user for login");
        next();
    } else {
        logger.info(
            `Error checking data user for login: ${resultCheckingData.error}`
        );
        res.status(400).json(resultCheckingData.error);
    }
}

async function validationChangePassword(req, res, next) {
    const token = await getTokenFromHeaders(req);
    const checkToken = await VerifiedToken(token);
    if (!checkToken) {
        return res.status(401).json({ error: "Invalid token" });
    }
    const userRequestChangePassword = req.body;
    const rules = validationRules["changePassword"];
    const resultCheckingData = await validateFields(
        userRequestChangePassword,
        rules
    );
    if (resultCheckingData.valid == true) {
        logger.info("Successfull checking data user for changing password");
        next();
    } else {
        logger.info(
            `Error checking data user for changing password: ${resultCheckingData.error}`
        );
        res.status(400).json(resultCheckingData.error);
    }
}

module.exports = { validateRegister, validateLogin, validationChangePassword };
