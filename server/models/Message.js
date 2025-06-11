/* models/message.js */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true }
    },
    { timestamps: { createdAt: true, updatedAt: false } }  // chỉ cần createdAt
);

// index ghép khoá giúp paging cực nhanh (mới ➜ cũ)
MessageSchema.index({ conversationId: 1, _id: -1 });

module.exports = mongoose.model('Message', MessageSchema);
