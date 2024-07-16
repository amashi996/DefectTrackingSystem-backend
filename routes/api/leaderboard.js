const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");

// @route   GET api/leaderboard
// @desc    Get leaderboard sorted by totalPoints
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    // Fetch users and sort them by totalPoints in descending order
    const leaderboard = await User.find()
      .sort({ totalPoints: -1 })
      .select("name avatar email totalPoints");

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
