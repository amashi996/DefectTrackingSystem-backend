const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const Achievement = require("../../models/Achievement");
const Badge = require("../../models/Badge");

// @route   POST api/achievements
// @desc    Create a new achievement
// @access  Private
router.post(
  "/",
  auth,
  [
    check("name", "Achievement name is required").notEmpty(),
    check("description", "Achievement description is required").notEmpty(),
    check(
      "sendingReviewPoints",
      "Sending Review Points are required"
    ).isNumeric(),
    check(
      "receivingReviewPoints",
      "Receiving Review Points are required"
    ).isNumeric(),
    check("badge", "Badge ID is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        description,
        sendingReviewPoints,
        receivingReviewPoints,
        badge,
      } = req.body;
      const achievement = new Achievement({
        name,
        description,
        sendingReviewPoints,
        receivingReviewPoints,
        badge,
      });
      await achievement.save();
      res.status(201).json(achievement);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/achievements
// @desc    Get all achievements
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const achievements = await Achievement.find().populate("badge");
    res.status(200).json(achievements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/achievements/:id
// @desc    Get an achievement by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id).populate(
      "badge"
    );
    if (!achievement)
      return res.status(404).json({ msg: "Achievement not found" });
    res.status(200).json(achievement);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/achievements/:id
// @desc    Update an achievement
// @access  Private
router.put(
  "/:id",
  auth,
  [
    check("name", "Achievement name is required").optional().notEmpty(),
    check("description", "Achievement description is required")
      .optional()
      .notEmpty(),
    check("sendingReviewPoints", "Sending Review Points are required")
      .optional()
      .isNumeric(),
    check("receivingReviewPoints", "Receiving Review Points are required")
      .optional()
      .isNumeric(),
    check("badge", "Badge ID is required").optional().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        description,
        sendingReviewPoints,
        receivingReviewPoints,
        badge,
      } = req.body;
      const achievement = await Achievement.findByIdAndUpdate(
        req.params.id,
        {
          name,
          description,
          sendingReviewPoints,
          receivingReviewPoints,
          badge,
        },
        { new: true }
      );
      if (!achievement)
        return res.status(404).json({ msg: "Achievement not found" });
      res.status(200).json(achievement);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/achievements/:id
// @desc    Delete an achievement
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement)
      return res.status(404).json({ msg: "Achievement not found" });
    res.status(200).json({ msg: "Achievement deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
