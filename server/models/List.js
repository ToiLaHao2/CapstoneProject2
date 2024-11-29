const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ListSchema = new Schema({
  list_title: {
    type: String,
    required: true,
  },
  list_cards: [
    {
      card_numerical_order: {
        type: Number,
        required: true,
      },
      card_id: {
        type: Schema.Types.ObjectId,
        ref: "Card",
      },
    },
  ],
  board_id: {
    type: Schema.Types.ObjectId,
    ref: "Board",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

module.exports = mongoose.model("List", ListSchema);
