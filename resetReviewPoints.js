const mongoose = require("mongoose");
const config = require("config");
const User = require("./models/User");

const db = config.get("mongoURI");

const resetReviewPoints = async () => {
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
      // Reset review points fields to their default values
      user.sendingReviewPoints = 0;
      user.receivingReviewPoints = 0;
      user.totalPoints = 0;

      // Save the updated user
      await user.save();
    }

    console.log("Review points reset successfully for all users");
  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    await mongoose.disconnect();
  }
};

resetReviewPoints();
