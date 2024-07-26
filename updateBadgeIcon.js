// updateBadgeIcons.js
const mongoose = require("mongoose");
const config = require("config");
const Badge = require("./models/Badge"); // Adjust the path as needed

// Load the database URI from the config file
const db = config.get("mongoURI");

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Function to update multiple badge icons
const updateBadgeIcons = async (badgeUpdates) => {
  try {
    for (const { badgeId, newIconUrl } of badgeUpdates) {
      const badge = await Badge.findByIdAndUpdate(
        badgeId,
        { icon: newIconUrl },
        { new: true, useFindAndModify: false }
      );

      if (!badge) {
        console.log(`Badge with ID ${badgeId} not found`);
        continue;
      }

      console.log(`Badge with ID ${badgeId} updated successfully:`, badge);
    }
  } catch (err) {
    console.error("Error updating badge icons:", err.message);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Example usage with a list of badge IDs and new icon URLs
const badgeUpdates = [
  {
    badgeId: "66961aa3d99f0f5362b88380",
    newIconUrl:
      "https://mysliit-my.sharepoint.com/my?id=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges%2FNovice%20Reviewer%20Icon%2Epng&parent=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges",
  },
  {
    badgeId: "66961aa6d99f0f5362b88383",
    newIconUrl:
      "https://mysliit-my.sharepoint.com/my?id=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges%2FRegular%20Reviewer%2Epng&parent=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges",
  },
  {
    badgeId: "66961aa7d99f0f5362b88385",
    newIconUrl:
      "https://mysliit-my.sharepoint.com/my?id=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges%2FActive%20Contributor%2Epng&parent=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges",
  },
  {
    badgeId: "66961aa7d99f0f5362b88387",
    newIconUrl:
      "https://mysliit-my.sharepoint.com/my?id=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges%2FTop%20Reviewer%2Epng&parent=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges",
  },
  {
    badgeId: "66961aa7d99f0f5362b88389",
    newIconUrl:
      "https://mysliit-my.sharepoint.com/my?id=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges%2FMaster%20Reviewer%2Epng&parent=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges",
  },
  {
    badgeId: "66961aa7d99f0f5362b8838b",
    newIconUrl:
      "https://mysliit-my.sharepoint.com/my?id=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges%2FAppreciated%2Epng&parent=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges",
  },
  {
    badgeId: "66961aa8d99f0f5362b8838d",
    newIconUrl:
      "https://mysliit-my.sharepoint.com/my?id=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges%2FRecognized%2Epng&parent=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges",
  },
  {
    badgeId: "66961aa8d99f0f5362b8838f",
    newIconUrl:
      "https://mysliit-my.sharepoint.com/my?id=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges%2FValued%20Contributor%2Epng&parent=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges",
  },
  {
    badgeId: "66961aa8d99f0f5362b88391",
    newIconUrl:
      "https://mysliit-my.sharepoint.com/my?id=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges%2FHighly%20Valued%2Epng&parent=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges",
  },
  {
    badgeId: "66961aa8d99f0f5362b88393",
    newIconUrl:
      "https://mysliit-my.sharepoint.com/my?id=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges%2FCommunity%20Favorite%2Epng&parent=%2Fpersonal%2Fms22036766%5Fmy%5Fsliit%5Flk%2FDocuments%2FBadges",
  },
];

updateBadgeIcons(badgeUpdates);
