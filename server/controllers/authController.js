const User = require("../models/User");
const {
    HashPassword,
    CompareHashPassword,
    CreateToken
} = require("../utils/authHelpers");
const { sendSuccess, sendError } = require("../utils/response");
const logger = require("../utils/logger");

async function Register(req, res) {
    const userRegist = req.body;
    try {
        let userBaseOnEmail = await User.findOne({
            user_email: userRegist.user_email
        });
        if (userBaseOnEmail !== null) {
            return sendError(res, 400, "Email is already in use");
        }
        const hashedPassword = (await HashPassword(
            userRegist.user_password
        )).toString();
        let user = new User({
            user_full_name: userRegist.user_full_name,
            user_email: userRegist.user_email,
            user_hashed_password: hashedPassword,
            user_avatar_url: userRegist.user_avatar_url,
            created_At: Date.now()
        });
        const newUser = await user.save();
        const token = await CreateToken(newUser._id);
        return sendSuccess(res, "Successfull register", { token: token });
    } catch (error) {
        logger.error(`Error with register: ${error}`);
        return sendError(res, 500, "Internal server error");
    }
}

async function Login(req, res) {
    const userLogin = req.body;
    try {
        let user = await User.findOne({ user_email: userLogin.user_email });
        if (user === null) {
            return sendError(res, 400, "Email is not found");
        }
        const isValidPassword = await CompareHashPassword(
            userLogin.user_password,
            user.user_hashed_password
        );
        if (isValidPassword === true) {
            const token = await CreateToken(user._id);
            return sendSuccess(res, "Login succesfull", { token: token });
        } else {
            return sendError(res, 401, "Wrong password");
        }
    } catch (error) {
        logger.error(`Error : ${error}`);
        return sendError(res, 500, "Internal server error");
    }
}

async function ChangePassword(req, res) {
    const userRequest = req.body;
    try {
        let user = await User.findOne({ user_email: userRequest.user_email });
        if (user === null) {
            return sendError(res, 400, "User not found");
        }
        let compareHashPassword = await CompareHashPassword(
            userRequest.user_last_password,
            user.user_hashed_password
        );
        if (compareHashPassword === true) {
            const newHashPassword = (await HashPassword(
                userRequest.user_password
            )).toString();
            await user.updateOne({
                $set: { user_hashed_password: newHashPassword }
            });
            return sendSuccess(res, "Successfull change password");
        } else {
            return sendError(res, 400, "Password not match");
        }
    } catch (error) {
        logger.error(`Error : ${error}`);
        return sendError(res, 500, "Internal server error");
    }
}

module.exports = { Register, Login, ChangePassword };
