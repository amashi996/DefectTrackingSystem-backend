const mongoose = require("mongoose");
const config = require("config");
const User = require("./models/User");
const Achievement = require("./models/Achievement");
const Badge = require("./models/Badge");

// Connect to MongoDB
mongoose
  .connect(config.get("mongoURI"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userRole: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String },
  date: { type: Date, default: Date.now },
  sendingReviewPoints: { type: Number, default: 0 },
  receivingReviewPoints: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  achievements: [
    {
      achievement_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Achievement",
      },
      name: { type: String },
      description: { type: String },
      earned_date: { type: Date, default: Date.now },
    },
  ],
  badges: [
    {
      badge_id: { type: mongoose.Schema.Types.ObjectId, ref: "Badge" },
      name: { type: String },
      description: { type: String },
      icon: { type: String },
      earned_date: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model("User", userSchema);

// Update all user profiles
async function updateAllUsers() {
  try {
    const users = await User.find();

    for (const user of users) {
      // Update the badges field with new attributes
      user.badges.forEach(async (badge) => {
        const badgeDetails = await Badge.findById(badge.badge_id);
        if (badgeDetails) {
          badge.name = badgeDetails.name;
          badge.description = badgeDetails.description;
          badge.icon = badgeDetails.icon;
        }
      });

      await user.save();
      console.log(`Updated user profile: ${user._id}`);
    }

    console.log("All user profiles updated successfully.");
  } catch (err) {
    console.error("Error updating user profiles:", err);
  } finally {
    mongoose.connection.close();
  }
}

updateAllUsers();
