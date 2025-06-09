const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    message_sender_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message_content: {
        type: String,
        required: true,
    },
    message_conversation_id: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Message", MessageSchema);
