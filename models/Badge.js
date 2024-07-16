const mongoose = require("mongoose");
const { type } = require("requests");
const Schema = mongoose.Schema;

const BadgeSchema = new Schema({
  name: {
    type: String,
    required: true,
    uniques: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // URL or path of the icon
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Badge", BadgeSchema);
