const mongoose = require("mongoose");
const config = require("config");
const User = require("./models/User");

const db = config.get("mongoURI");

const removeAllAchievementsAndBadges = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = await User.find({}); // Fetch all users

    if (!users || users.length === 0) {
      console.log("No users found");
      return;
    }

    // Iterate through all users
    for (const user of users) {
      // Clear achievements and badges
      user.achievements = [];
      user.badges = [];

      // Save the updated user
      await user.save();
    }

    console.log("Achievements and badges removed successfully from all users");
  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    await mongoose.disconnect();
  }
};

removeAllAchievementsAndBadges();
