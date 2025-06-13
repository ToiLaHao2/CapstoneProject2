const express = require("express");
const {
    validateLogin,
    validateRegister,
    validationChangePassword,
    validateLogout,
} = require("../middleware/authMidleware");
const {
    Register,
    Login,
    ChangePassword,
    Logout,
} = require("../controllers/authController");

const authRouter = express.Router();

authRouter.post("/register", validateRegister, Register);
authRouter.post("/login", validateLogin, Login);
authRouter.post("/logout", validateLogout, Logout);
// authRouter.post("/forgotPassword");
authRouter.post("/changePassword", validationChangePassword, ChangePassword);

module.exports = authRouter;
