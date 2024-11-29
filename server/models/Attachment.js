const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AttachmentSchema = new Schema({
  attachment_card_id: {
    type: Schema.Types.ObjectId,
    ref: "Card",
  },
  attachment_type: {
    type: String,
    enum: ["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"],
  },
  attachment_url: {
    type: String,
    required: true,
  },
  attachment_name: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Attachment", AttachmentSchema);
