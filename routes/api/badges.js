const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Badge = require("../../models/Badge");

// @route    POST api/badges/
// @desc     Create a new badge
// @access   Private
router.post(
  "/",
  auth,
  check("name", "Badge name is required").notEmpty(),
  check("description", "Badge description is required").notEmpty(),
  check("icon", "Badge icon is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const { name, description, icon } = req.body;
      const badge = new Badge({ name, description, icon });
      await badge.save();
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/badges/
// @desc     Get all badges
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    const badges = await Badge.find().sort({ date: -1 });

    const badgesWithHtml = badges.map((badge) => ({
      ...badge.toObject(),
      iconHtml: `<img src="${badge.icon}" alt="${badge.name}" />`,
    }));

    res.json(badgesWithHtml);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/badges/:id
// @desc     Get a badge by ID
// @access   Private
router.get("/:id", auth, async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) return res.status(404).json({ msg: "Badge not found" });

    const badgeWithHtml = {
      ...badge.toObject(),
      iconHtml: `<img src="${badge.icon}" alt="${badge.name}" />`,
    };

    res.json(badgeWithHtml);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/badges/:id
// @desc     Update a badge
// @access   Private
router.put(
  "/:id",
  auth,
  check("name", "Badge name is required").optional().notEmpty(),
  check("description", "Badge description is required").optional().notEmpty(),
  check("icon", "Badge icon is required").optional().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const { name, description, icon } = req.body;
      const badge = await Badge.findByIdAndUpdate(
        req.params.id,
        { name, description, icon },
        { new: true }
      );
      if (!badge) return res.status(404).json({ msg: "Badge not found" });
      res.json(badge);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/badges/:id
// @desc     Delete a badge
// @access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) return res.status(404).json({ msg: "Badge not found" });
    res.json({ msg: "Badge deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
