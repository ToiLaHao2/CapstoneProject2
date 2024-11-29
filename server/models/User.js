const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  user_full_name: {
    type: String,
    required: true,
  },
  user_email: {
    type: String,
    required: true,
  },
  user_hashed_password: {
    type: String,
    required: true,
  },
  user_avatar_url: {
    type: String,
    require: true,
  },
  boards: [
    {
      board_id: {
        type: Schema.Types.ObjectId,
        ref: "Board",
      },
      role: {
        type: String,
        enum: ["ADMIN", "MEMBER"],
      },
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

module.exports = mongoose.model("User", UserSchema);
