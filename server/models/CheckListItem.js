const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CheckListItemSchema = new Schema({
  cl_item_id: {
    type: Schema.Types.ObjectId,
    ref: "CheckList",
  },
  cl_item_content: {
    type: String,
    required: true,
  },
  cl_item_isChecked: {
    type: Boolean,
    default: false,
  },
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

module.exports = mongoose.model("CheckListItem", CheckListItemSchema);
