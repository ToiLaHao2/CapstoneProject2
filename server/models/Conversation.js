const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
    conversation_board_id: {
        type: Schema.Types.ObjectId,
        ref: "Board",
        required: true,
    },
    conversation_title: {
        type: String,
        required: true,
    },
    conversation_participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    conversation_messages: [
        {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
    ],
    conversation_owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    conversation_avatar_url: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Conversation", ConversationSchema);
