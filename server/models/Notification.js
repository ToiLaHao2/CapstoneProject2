const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema(
    {
        notification_sender_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        notification_receiver_ids: [
            {
                receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                is_read: { type: Boolean, default: false },
            },
        ],
        notification_title: { type: String, required: true },
        notification_message: { type: String, required: true },
        notification_reference: { type: String, required: true },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: false } } // tự sinh created_at
);

// thêm 1 index đơn giản để khi lấy thông báo theo user nhanh hơn
NotificationSchema.index({ 'notification_receiver_ids.receiver_id': 1, created_at: -1 });

module.exports = model('Notification', NotificationSchema);
