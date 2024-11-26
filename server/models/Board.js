const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BoardSchema = new Schema({
  board_title: {
    type: String,
    required: true,
  },
  board_description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  board_is_public: {
    type: Boolean,
    required: true,
    default: false,
  },
  board_collaborators: [
    {
      board_collaborator_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      board_collaborator_role: {
        type: String,
        enum: ["VIEWER", "EDITOR"],
      },
    },
  ],
  board_lists: [
    {
      list_numerical_order: {
        type: Number,
        required: true,
      },
      list_id: {
        type: Schema.Types.ObjectId,
        ref: "List",
      },
    },
  ],
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

module.exports = mongoose.model("Board", BoardSchema);
