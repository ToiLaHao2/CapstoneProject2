const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    notification_sender_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    notification_receiver_ids: [{
        receiver_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        is_read: {
            type: Boolean,
            default: false,
        },
    }],
    notification_title: {
        type: String,
        required: true,
    },
    notification_message: {
        type: String,
        required: true,
    },
    notification_reference: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Notification", NotificationSchema);
