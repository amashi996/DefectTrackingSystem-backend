const mongoose = require("mongoose");
const config = require("config");
const User = require("./models/User");

// Connect to MongoDB
const db = config.get("mongoURI");

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const updateUserPoints = async () => {
  try {
    // Fetch all users
    const users = await User.find();

    // Iterate over each user
    for (let user of users) {
      // Calculate totalPoints
      const totalPoints = user.sendingReviewPoints + user.receivingReviewPoints;

      // Update the user
      user.totalPoints = totalPoints;
      await user.save();
    }

    console.log("Total points updated for all users.");

    // Disconnect from MongoDB
    mongoose.disconnect();
  } catch (err) {
    console.error(err.message);
    mongoose.disconnect();
  }
};

// Run the update
updateUserPoints();
