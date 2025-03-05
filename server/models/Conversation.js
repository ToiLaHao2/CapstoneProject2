const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
    conversation_title: {
        type: String,
        required: true
    },
    conversation_participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    conversation_messages: [
        {
            type: Schema.Types.ObjectId,
            ref: "Message"
        }
    ],
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Conversation", ConversationSchema);
