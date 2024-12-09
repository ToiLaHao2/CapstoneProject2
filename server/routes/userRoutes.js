const express = require("express");
const { validateGetUserProfile } = require("../middleware/userMiddleware");
const {} = require("../controllers/userController");

const authRouter = express.Router();

authRouter.post("/getProfile", validateGetUserProfile);
// authRouter.post("/login", validateLogin, Login);
// authRouter.post("/logout");
// authRouter.post("/profile");
// authRouter.post("/changePassword", validationChangePassword, ChangePassword);

module.exports = authRouter;
