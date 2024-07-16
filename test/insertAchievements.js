const mongoose = require("mongoose");
const config = require("config");
const Achievement = require("./models/Achievement");
const Badge = require("./models/Badge");

// Connect to MongoDB
const db = config.get("mongoURI");

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Array of achievements to add
const achievements = [
  {
    name: "First Review Sent",
    description: "Awarded for sending the first review",
    sendingReviewPoints: 1,
    receivingReviewPoints: 0,
    badge: "Novice Reviewer",
  },
  {
    name: "Regular Reviewer",
    description: "Awarded for sending 10 reviews",
    sendingReviewPoints: 10,
    receivingReviewPoints: 0,
    badge: "Regular Reviewer",
  },
  {
    name: "Active Contributor",
    description: "Awarded for sending 50 reviews",
    sendingReviewPoints: 25,
    receivingReviewPoints: 0,
    badge: "Active Contributor",
  },
  {
    name: "Top Reviewer",
    description: "Awarded for sending 100 reviews",
    sendingReviewPoints: 75,
    receivingReviewPoints: 0,
    badge: "Top Reviewer",
  },
  {
    name: "Master Reviewer",
    description: "Awarded for sending 500 reviews",
    sendingReviewPoints: 100,
    receivingReviewPoints: 0,
    badge: "Master Reviewer",
  },
  {
    name: "First Review Gained",
    description: "Awarded for receiving the first review",
    sendingReviewPoints: 0,
    receivingReviewPoints: 0.5,
    badge: "Appreciated",
  },
  {
    name: "Recognized",
    description: "Awarded for receiving 10 reviews",
    sendingReviewPoints: 0,
    receivingReviewPoints: 5,
    badge: "Recognized",
  },
  {
    name: "Valued Contributor",
    description: "Awarded for receiving 50 reviews",
    sendingReviewPoints: 0,
    receivingReviewPoints: 25,
    badge: "Valued Contributor",
  },
  {
    name: "Highly Valued",
    description: "Awarded for receiving 100 reviews",
    sendingReviewPoints: 0,
    receivingReviewPoints: 50,
    badge: "Highly Valued",
  },
  {
    name: "Community Favorite",
    description: "Awarded for receiving 500 reviews",
    sendingReviewPoints: 0,
    receivingReviewPoints: 250,
    badge: "Community Favorite",
  },
];

// Function to insert achievements into the database
async function insertAchievements() {
  try {
    // Fetch all badges
    const badges = await Badge.find({
      name: { $in: achievements.map((a) => a.badge) },
    });

    // Create a map of badge names to their ObjectId
    const badgeMap = badges.reduce((map, badge) => {
      map[badge.name] = badge._id;
      return map;
    }, {});

    // Create achievement documents
    const achievementsToInsert = achievements.map((a) => ({
      name: a.name,
      description: a.description,
      sendingReviewPoints: a.sendingReviewPoints,
      receivingReviewPoints: a.receivingReviewPoints,
      badge: badgeMap[a.badge],
    }));

    // Insert achievements into the database
    await Achievement.insertMany(achievementsToInsert);
    console.log("All achievements inserted successfully");
  } catch (err) {
    console.error("Error inserting achievements:", err);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Run the function to insert achievements
insertAchievements();
