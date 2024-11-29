const User = require("../models/User");
const mongoose = require("mongoose");
const Schema = mongoose.Schema();
const {
    HashPassword,
    CompareHashPassword,
    CreateToken
} = require("../utils/authHelpers");
const logger = require("../utils/logger");

async function Register(req, res) {
    const userRegist = req.body;
    try {
        let userBaseOnEmail = User.findOne({
            user_email: userRegist.user_email
        });
        if (!userBaseOnEmail) {
            return res
                .status(400)
                .json({ message: "User email already exist" });
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
        return res
            .status(201)
            .json({ message: "Successful register", token: token });
    } catch (error) {
        logger.error(`Error with register: ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
}

async function Login(req, res) {
    const userLogin = req.body;
    try {
        let user = await User.findOne({ user_email: userLogin.user_email });
        if (user === null) {
            return res.status(400).json({ message: "User not found" });
        }
        const isValidPassword = await CompareHashPassword(
            userLogin.user_password,
            user.user_hashed_password
        );
        if (isValidPassword === true) {
            const token = await CreateToken(user._id);
            return res
                .status(200)
                .json({ message: "Login successful", token: token });
        } else {
            return res.status(400).json({ message: "Invalid password" });
        }
    } catch (error) {
        logger.error(`Error : ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
}

async function ChangePassword(req, res) {
    const userRequest = req.body;
    try {
        let user = await User.findOne({ user_email: userRequest.user_email });
        let compareHashPassword = await CompareHashPassword(
            userRequest.user_last_password,
            user.user_hashed_password
        );
        if (compareHashPassword == true) {
            const newHashPassword = (await HashPassword(
                userRequest.user_password
            )).toString();
            await user.updateOne({ $set: { user_hashed_password: newHashPassword } });
            return res
                .status(200)
                .json({ message: "Successfull change password" });
        } else {
            res.status(400).json({ message: "Password not match" });
        }
    } catch (error) {
        logger.error(`Error : ${error}`);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { Register, Login, ChangePassword };
