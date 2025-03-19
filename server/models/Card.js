const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CardSchema = new Schema({
    card_title: {
        type: String,
        required: true,
    },
    card_description: {
        type: String,
    },
    card_duration: {
        type: Date,
    },
    card_assignees: [
        {
            card_assignee_id: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        },
    ],
    card_labels: [
        {
            card_label_id: {
                type: Schema.Types.ObjectId,
                ref: "Label",
                required: true,
            },
        },
    ],
    card_checklist_id: {
        type: Schema.Types.ObjectId,
        ref: "Checklist",
    },
    card_attachments: [
        {
            card_attachment_id: {
                type: Schema.Types.ObjectId,
                ref: "Attachment",
                required: true,
            },
        },
    ],
    card_comments: [
        {
            card_comment_id: {
                type: Schema.Types.ObjectId,
                ref: "Comment",
                required: true,
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
    updated_by: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = mongoose.model("Card", CardSchema);
