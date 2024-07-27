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

// Function to update user achievements and badges
const updateUserAchievements = async () => {
  try {
    // Fetch all users
    const users = await User.find();

    // Loop through each user
    for (const user of users) {
      // Update achievements
      const achievements = await Achievement.find({
        _id: { $in: user.achievements.map((ach) => ach.achievement_id) },
      });
      user.achievements = user.achievements.map((ach) => {
        const achievement = achievements.find((a) =>
          a._id.equals(ach.achievement_id)
        );
        return {
          achievement_id: ach.achievement_id,
          name: achievement ? achievement.name : "Unknown Achievement",
          description: achievement ? achievement.description : "No description",
          earned_date: ach.earned_date,
        };
      });

      // Update badges
      const badges = await Badge.find({
        _id: { $in: user.badges.map((bad) => bad.badge_id) },
      });
      user.badges = user.badges.map((bad) => {
        const badge = badges.find((b) => b._id.equals(bad.badge_id));
        return {
          badge_id: bad.badge_id,
          name: badge ? badge.name : "Unknown Badge",
          description: badge ? badge.description : "No description",
          icon: badge ? badge.icon : "No icon",
          earned_date: bad.earned_date,
        };
      });

      // Save updated user
      await user.save();
      console.log(`User ${user.username} updated successfully.`);
    }
  } catch (err) {
    console.error("Error updating user achievements:", err);
  } finally {
    mongoose.connection.close();
  }
};

// Execute the function
updateUserAchievements();
