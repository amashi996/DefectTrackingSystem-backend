const mongoose = require("mongoose");
const config = require("config");
const Badge = require("./models/Badge");

// Connect to MongoDB
const db = config.get("mongoURI");

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Array of badges to add
const badges = [
  {
    name: "Novice Reviewer",
    description: "Awarded for sending the first review",
    icon: "https://mysliit-my.sharepoint.com/:i:/g/personal/ms22036766_my_sliit_lk/EYrYDl_-pRpKiDc2GdhgTYUB_OOomzD9eLpkiwND3RKE6A?e=j4pKXD",
  },
  {
    name: "Regular Reviewer",
    description: "Awarded for sending 10 reviews",
    icon: "https://mysliit-my.sharepoint.com/:i:/g/personal/ms22036766_my_sliit_lk/EbgKw7vMgGNDoHyV7mLastwBbzidywTr49WtwsE2-5PhcA?e=mXXdqN",
  },
  {
    name: "Active Contributor",
    description: "Awarded for sending 50 reviews",
    icon: "https://mysliit-my.sharepoint.com/:i:/g/personal/ms22036766_my_sliit_lk/EaSQMp5ZfexOvy2dOxgvPBIBqQRD8XOKEXhHhFqFMQ4TgA?e=XdPg3q",
  },
  {
    name: "Top Reviewer",
    description: "Awarded for sending 100 reviews",
    icon: "https://mysliit-my.sharepoint.com/:i:/g/personal/ms22036766_my_sliit_lk/ESDqnESABDtKrkVx_gGRl3oBBBisHqMsDSR_OPoWVyecAg?e=aNAPym",
  },
  {
    name: "Master Reviewer",
    description: "Awarded for sending 500 reviews",
    icon: "https://mysliit-my.sharepoint.com/:i:/g/personal/ms22036766_my_sliit_lk/EUlWN-PIKUhLg6ensMH4L3sBid8yr_2zuh2Zlf6bj9wS9A?e=qP0zt2",
  },
  {
    name: "Appreciated",
    description: "Awarded for receiving the first review",
    icon: "https://mysliit-my.sharepoint.com/:i:/g/personal/ms22036766_my_sliit_lk/Eej26Y2xVp1AjF0ZuKcGFTMBXvuo47CJRDgKVu-HSaCGEg?e=bRKK66",
  },
  {
    name: "Recognized",
    description: "Awarded for receiving 10 reviews",
    icon: "https://mysliit-my.sharepoint.com/:i:/g/personal/ms22036766_my_sliit_lk/EVHs4Hp0izJHqnQN09yTdbMBfgGDnc-LS6egcqgUh9SC7Q?e=ssEl8B",
  },
  {
    name: "Valued Contributor",
    description: "Awarded for receiving 50 reviews",
    icon: "https://mysliit-my.sharepoint.com/:i:/g/personal/ms22036766_my_sliit_lk/ESaf_W8tWFFMu9eB7495QG0BQsoVCA8V2zT0IUKOg8wjkg?e=KKxiCQ",
  },
  {
    name: "Highly Valued",
    description: "Awarded for receiving 100 reviews",
    icon: "https://mysliit-my.sharepoint.com/:i:/g/personal/ms22036766_my_sliit_lk/EVWOQ51y8zNEjczbxKUap-YB7PPARn19ajLUvTtfwVlG-w?e=ozLnyc",
  },
  {
    name: "Community Favorite",
    description: "Awarded for receiving 500 reviews",
    icon: "https://mysliit-my.sharepoint.com/:i:/g/personal/ms22036766_my_sliit_lk/ETngNO8g92pKk4JJAoAWgeoB93x-CPtrCdsqUTE5phGTgg?e=q8swfk",
  },
];

// Function to add badges to the database
async function updateBadges() {
  try {
    for (const badgeData of badges) {
      const badge = new Badge(badgeData);
      await badge.save();
      console.log(`Badge ${badge.name} added`);
    }
    console.log("All badges added successfully");
  } catch (err) {
    console.error("Error adding badges:", err);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Run the function to add badges
updateBadges();
