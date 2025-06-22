/* models/conversation.js */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new Schema(
    {
        boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
        title: { type: String, required: true },
        participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],   // danh sách thành viên
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        // phục vụ hiển thị list conversation
        lastMessageId: { type: Schema.Types.ObjectId, ref: 'Message' },
        lastMessageAt: { type: Date },

        avatarUrl: { type: String },
        created_at: {
            type: Date,
            default: Date.now
        },
        updated_at: {
            type: Date,
        }
    },
);

// index để list & tìm kiếm nhanh
ConversationSchema.index({ boardId: 1 });
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
