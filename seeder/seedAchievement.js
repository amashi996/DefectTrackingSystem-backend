const mongoose = require("mongoose");
const config = require("config");
const Achievement = require("../models/AchievementTest");
const Badge = require("../models/Badge");

const db = config.get("mongoURI");

const seedAchievements = async () => {
  await mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const badge1 = new Badge({
    name: "First Review",
    description: "First review sent",
    icon: "icon1.png",
  });
  const badge2 = new Badge({
    name: "First Received Review",
    description: "First review received",
    icon: "icon2.png",
  });
  await badge1.save();
  await badge2.save();

  const achievements = [
    {
      name: "First Review Sent",
      description: "Sent your first review",
      points: 1,
      badge: badge1._id,
    },
    {
      name: "First Review Received",
      description: "Received your first review",
      points: 1,
      badge: badge2._id,
    },
    {
      name: "Sent 5 Reviews",
      description: "Sent 5 reviews",
      points: 5,
      badge: badge1._id,
    },
    {
      name: "Received 5 Reviews",
      description: "Received 5 reviews",
      points: 5,
      badge: badge2._id,
    },
    {
      name: "Sent 10 Reviews",
      description: "Sent 10 reviews",
      points: 10,
      badge: badge1._id,
    },
    {
      name: "Received 10 Reviews",
      description: "Received 10 reviews",
      points: 10,
      badge: badge2._id,
    },
  ];

  for (const achievement of achievements) {
    const newAchievement = new Achievement(achievement);
    await newAchievement.save();
  }

  console.log("Achievements and Badges seeded");
  mongoose.disconnect();
};

seedAchievements();
