const mongoose = require("mongoose");
const { type } = require("requests");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  sendingReviewPoints: {
    type: Number,
    default: 0,
  }, // cal points
  receivingReviewPoints: {
    type: Number,
    default: 0,
  }, // cal points
  totalPoints: {
    type: Number,
    default: 0,
  }, // add sendingReviePoints and receivingReviewPoints
  achievements: [
    {
      achievement_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Achievement",
      },
      earned_date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  badges: [
    {
      badge_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
      },
      earned_date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Pre-save hook to update totalPoints
UserSchema.pre("save", function (next) {
  this.totalPoints = this.sendingReviewPoints + this.receivingReviewPoints;
  next();
});

module.exports = User = mongoose.model("User", UserSchema);
