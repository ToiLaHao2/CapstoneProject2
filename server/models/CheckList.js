const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CheckListSchema = new Schema({
    checklist_card_id: {
        type: Schema.Types.ObjectId,
        ref: "Card",
    },
    checklist_items: [
        {
            item_id: {
                type: Schema.Types.ObjectId,
                ref: "CheckListItem",
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

module.exports = mongoose.model("CheckList", CheckListSchema);
