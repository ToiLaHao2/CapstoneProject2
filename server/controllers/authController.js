const User = require("../models/User");
const mongoose = require("mongoose");
const Schema = mongoose.Schema();
const {
  HashPassword,
  CompareHashPassword,
  CreateToken,
} = require("../utils/authHelpers");

async function Register(req, res) {
  const userRegist = req.body;
  try {
    let userBaseOnEmail = User.findOne({user_email: userRegist})
    if (!userBaseOnEmail) {
      return res.status(400).json({ message: "User email already exist" });
    }
    const hashedPassword = (
      await HashPassword(userRegist.user_password)
    ).toString();
    user = new User({
      user_full_name: userRegist.user_name,
      user_email: userRegist.user_email,
      user_password: hashedPassword,
      user_avatar_url: userRegist.user_avatar_url,
      created_At: Date.now(),
    });
    const newUser = await user.save();
    const token = await CreateToken(newUser._id);
    res.status(201).json({ message: "Successful register", token: token });
  } catch (error) {
    console.log("Error : " + error);
    res.status(500).json({ message: "Server error" });
  }
}

async function Login(req, res) {
  const userLogin = req.body;
  try {
    let user = await User.findOne({ user_name: userLogin.user_name });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isValidPassword = await CompareHashPassword(
      userLogin.user_password,
      user.user_password
    );
    if (isValidPassword) {
      const token = await CreateToken(user._id);
      return res
        .status(200)
        .json({ message: "Login successful", token: token });
    }
  } catch (error) {
    console.log("Error : " + error);
    res.status(500).json({ message: "Server error" });
  }
}

async function ChangePassword(req, res) {
  const userRequest = req.body;
  try {
    let user = await User.findOne({ user_name: userRequest.user_name });
    let compareHashPassword = CompareHashPassword(
      userRequest.last_password,
      user.user_password
    );
    if (compareHashPassword) {
      const newHashPassword = (
        await HashPassword(userRequest.user_password)
      ).toString();
      await user.updateOne({ $set: { user_password: newHashPassword } });
      res.status(200).json({ message: "Successfull change password" });
    } else {
      res.status(404).json({ message: "Password not match" });
    }
  } catch (error) {
    console.log("Error : " + error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { Register, Login, ChangePassword };
