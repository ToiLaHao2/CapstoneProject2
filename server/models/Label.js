const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LabelSchema = new Schema({
  label_name: {
    type: String,
    required: true,
  },
  label_color: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Label", LabelSchema);
