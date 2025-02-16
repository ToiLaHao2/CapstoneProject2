const express = require("express");
const {
  validateGetUserProfile,
  validateUpdateUserProfile,
} = require("../middleware/userMiddleware");
const {
  GetUserProfile,
  UpdateUserProfile,
} = require("../controllers/userController");

const userRouter = express.Router();

userRouter.post("/getProfile", validateGetUserProfile, GetUserProfile);
userRouter.patch("/updateProfile", validateUpdateUserProfile, UpdateUserProfile);

module.exports = userRouter;
