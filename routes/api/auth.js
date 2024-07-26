const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get("/", auth, (req, res) => {
  // try {

  //   // res.json(user);
  // } catch (err) {
  //   console.error(err.message);
  //   res.status(500).send("Server Error");
  // }

  User.findById(req.user.id)
    .select("-password")
    .exec()
    .then((userObject) => {
      if (userObject) {
        res.status(200).json({
          user: userObject,
        });
      }
    })
    .catch((error) => {
      console.error(err.message);
      res.status(500).send("Server Error");
    });
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ errors: [{ email: "User not found" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(404)
          .json({ errors: [{ password: "Invalid password" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            token,
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route    GET api/auth/users
// @desc     Get all users
// @access   Public
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password from the result
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route    GET api/auth/achievements
// @desc     Get all achievements for the logged-in user
// @access   Private
router.get("/achievements", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "achievements.achievement_id",
      "name description"
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user.achievements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/auth/badges
// @desc     Get all badges for the logged-in user
// @access   Private
router.get("/badges", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "badges.badge_id",
      "name description"
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user.badges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
