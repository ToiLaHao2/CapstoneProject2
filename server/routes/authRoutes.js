const express = require("express");
const {
    validateLogin,
    validateRegister,
    validationChangePassword
} = require("../middleware/authMidleware");
const {
    Register,
    Login,
    ChangePassword
} = require("../controllers/authController");

const authRouter = express.Router();

authRouter.post("/register", validateRegister, Register);
authRouter.post("/login", validateLogin, Login);
// authRouter.post("/logout");
// authRouter.post("/profile");
authRouter.post("/changePassword", validationChangePassword, ChangePassword);

module.exports = authRouter;
