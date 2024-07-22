const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Review = require("../../models/Review");
const User = require("../../models/User");
const Achievement = require("../../models/Achievement");
const Badge = require("../../models/Badge");
const checkObjectID = require("../../middleware/checkObjectId");

// @route   GET api/reviews/
// @desc    Test Screen
// @access  Private
router.get("/test-rev", (req, res) =>
  res.json({
    msg: "Reviews Works",
  })
);

// @route    GET api/reviews/received
// @desc     Get reviews received to the logged-in user
// @access   Private
router.get("/received", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id }).sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/reviews/added
// @desc     Get reviews added by the logged-in user
// @access   Private
router.get("/added", auth, async (req, res) => {
  try {
    // Fetch the logged-in user's details
    const user = await User.findById(req.user.id).select("email");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Use the user's email to find the reviews they added
    const reviews = await Review.find({ reviewerEmail: user.email }).sort({
      date: -1,
    });

    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/reviews/
// @desc    Add a review for selected user
// @access  Private
router.post(
  "/addRev/:userId",
  auth,
  check("reviewText", "Review is required").notEmpty(),
  checkObjectID("userId"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      // Fetch the reviewee user
      const reviewee = await User.findById(req.params.userId).select(
        "-password"
      );
      if (!reviewee) {
        return res.status(404).json({
          msg: "Reviewee user not found",
        });
      }

      // Fetch the reviewer user
      const reviewer = await User.findById(req.user.id).select("-password");
      if (!reviewer) {
        return res.status(404).json({
          msg: "Reviewer user not found",
        });
      }

      const newReview = new Review({
        user: req.params.userId,
        reviewText: req.body.reviewText,
        name: req.user.name,
        avatar: req.user.avatar,
        reviewerName: reviewer.name,
        reviewerEmail: reviewer.email,
        reviewerAvatar: reviewer.avatar,
      });

      const review = await newReview.save();

      // Update points for the reviewer and the reviewee
      reviewer.sendingReviewPoints += 1;
      reviewee.receivingReviewPoints += 0.5;

      // Recalculate totalPoints
      reviewer.totalPoints =
        reviewer.sendingReviewPoints + reviewer.receivingReviewPoints;
      reviewee.totalPoints =
        reviewee.sendingReviewPoints + reviewee.receivingReviewPoints;

      // Save the updated user documents
      await reviewer.save();
      await reviewee.save();

      /**New strat here */
      // Function to check and award achievements and badges
      const checkAndAwardAchievements = async (user, type) => {
        const achievements = await Achievement.find({});
        const userPoints =
          type === "sending"
            ? user.sendingReviewPoints
            : user.receivingReviewPoints;

        for (const achievement of achievements) {
          const achievementPoints =
            type === "sending"
              ? achievement.sendingReviewPoints
              : achievement.receivingReviewPoints;

          if (userPoints === achievementPoints) {
            // Check if the user already has this achievement
            const hasAchievement = user.achievements.some((ach) =>
              ach.achievement_id.equals(achievement._id)
            );
            if (!hasAchievement) {
              user.achievements.push({ achievement_id: achievement._id });

              // Award the badge associated with the achievement
              const badge = await Badge.findById(achievement.badge);
              if (badge) {
                user.badges.push({ badge_id: badge._id });
              }
            }
          }
        }
      };

      // Check and award achievements and badges for reviewer and reviewee
      await checkAndAwardAchievements(reviewer, "sending");
      await checkAndAwardAchievements(reviewee, "receiving");

      // Save the updated user documents again to include achievements and badges
      await reviewer.save();
      await reviewee.save();
      /**New ends here */

      // Fetch and send updated user details
      const updatedUserReviewer = await User.findById(req.user.id);
      const updatedUserReviewee = await User.findById(req.params.userId);

      res.json({
        review,
        updatedUserReviewer,
        updatedUserReviewee,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// @route   PUT api/reviews/like/:reviewId
// @desc    Like a review
// @access  Private
router.put(
  "/like/:reviewId",
  auth,
  checkObjectID("reviewId"),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.reviewId);

      // Check if the review has already been liked
      if (review.likes.some((like) => like.user.toString() === req.user.id))
        return res.status(400).json({ msg: "Review already liked" });

      review.likes.unshift({ user: req.user.id });

      await review.save();

      return res.json(review.likes);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    PUT api/reviews/unlike/:reviewId
// @desc     Unlike a review
// @access   Private
router.put(
  "/unlike/:reviewId",
  auth,
  checkObjectID("reviewId"),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.reviewId);

      // Check if the review has not yet been liked
      if (!review.likes.some((like) => like.user.toString() === req.user.id)) {
        return res.status(400).json({ msg: "Review has not yet been liked" });
      }

      // Remove the like
      review.likes = review.likes.filter(
        ({ user }) => user.toString() !== req.user.id
      );

      await review.save();

      return res.json(review.likes);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/reviews
// @desc     Get all reviews
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/reviews/:reviewId
// @desc     Get review by ID
// @access   Private
router.get("/:reviewId", auth, checkObjectID("reviewId"), async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/reviews/comment/:reviewId
// @desc     Add a comment to a review
// @access   Private
router.post(
  "/comment/:reviewId",
  auth,
  checkObjectID("reviewId"),
  check("text", "Comment text is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const review = await Review.findById(req.params.reviewId);

      if (!review) {
        return res.status(404).json({ msg: "Review not found" });
      }

      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };

      review.reviewComments.unshift(newComment);

      await review.save();

      res.json(review.reviewComments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/reviews/deleteComment/:reviewId/:commentId
// @desc     Delete a comment from a review
// @access   Private
router.delete(
  "/deleteComment/:reviewId/:commentId",
  auth,
  checkObjectID("reviewId"),
  checkObjectID("commentId"),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.reviewId);

      if (!review) {
        return res.status(404).json({ msg: "Review not found" });
      }

      const comment = review.reviewComments.find(
        (comment) => comment.id === req.params.commentId
      );

      if (!comment) {
        return res.status(404).json({ msg: "Comment not found" });
      }

      // Check if the user deleting the comment is the one who added it
      if (comment.user.toString() !== req.user.id) {
        return res
          .status(401)
          .json({ msg: "User not authorized to delete this comment" });
      }

      // Remove the comment
      review.reviewComments = review.reviewComments.filter(
        ({ id }) => id !== req.params.commentId
      );

      await review.save();

      res.json(review.reviewComments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
