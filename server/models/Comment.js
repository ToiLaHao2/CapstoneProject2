const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  comment_card_id: {
    type: Schema.Types.ObjectId,
    ref: "Card",
  },
  comment_user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  comment_content: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
