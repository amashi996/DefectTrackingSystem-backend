const mongoose = require("mongoose");
const { type } = require("requests");
const Schema = mongoose.Schema;

const AchievementSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  sendingReviewPoints: {
    type: Number,
    required: true,
  },
  receivingReviewPoints: {
    type: Number,
    required: true,
  },
  badge: {
    type: Schema.Types.ObjectId,
    ref: "Badge",
    required: "true",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Achievement", AchievementSchema);
