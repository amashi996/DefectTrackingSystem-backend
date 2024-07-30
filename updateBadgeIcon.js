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
      "https://drive.google.com/file/d/1j7gvt1eoB1h-gIkdRkFIZvGTRGPP1XI4/view?usp=sharing",
  },
  {
    badgeId: "66961aa6d99f0f5362b88383",
    newIconUrl:
      "https://drive.google.com/file/d/18SgqzaUXUdisWGU-weck-KKl5mDl2oO-/view?usp=sharing",
  },
  {
    badgeId: "66961aa7d99f0f5362b88385",
    newIconUrl:
      "https://drive.google.com/file/d/1mZlzLf5uzuQD3p7iAQCzljTwOoQs_Pd6/view?usp=sharing",
  },
  {
    badgeId: "66961aa7d99f0f5362b88387",
    newIconUrl:
      "https://drive.google.com/file/d/1MrF0-KYA8ybLV84AADdQkDMAFjDULkhW/view?usp=sharing",
  },
  {
    badgeId: "66961aa7d99f0f5362b88389",
    newIconUrl:
      "https://drive.google.com/file/d/17HMd1eQnca0zL4RJHUDH6hO7Fk75Znbs/view?usp=sharing",
  },
  {
    badgeId: "66961aa7d99f0f5362b8838b",
    newIconUrl:
      "https://drive.google.com/file/d/1AkWoCwvLZ-_4dswicWw3pHAyENN4zF2j/view?usp=sharing",
  },
  {
    badgeId: "66961aa8d99f0f5362b8838d",
    newIconUrl:
      "https://drive.google.com/file/d/1BsAGgoBYCbVMjtrlGn3uqlyCi4yGK74g/view?usp=sharing",
  },
  {
    badgeId: "66961aa8d99f0f5362b8838f",
    newIconUrl:
      "https://drive.google.com/file/d/1UyebUJVCpUNc-jZgCbjsS9F3S4wtqFJX/view?usp=sharing",
  },
  {
    badgeId: "66961aa8d99f0f5362b88391",
    newIconUrl:
      "https://drive.google.com/file/d/1YXfGYiiHjejreAKz5tdmRuGeOZolYaJq/view?usp=sharing",
  },
  {
    badgeId: "66961aa8d99f0f5362b88393",
    newIconUrl:
      "https://drive.google.com/file/d/1B-Dqg04jK72s_dsolz36M67kj2kY1tFT/view?usp=sharing",
  },
];

updateBadgeIcons(badgeUpdates);
