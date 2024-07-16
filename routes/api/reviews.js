const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Review = require("../../models/Review");
const User = require("../../models/User");
const checkObjectID = require("../../middleware/checkObjectId");

// @route   GET api/reviews/
// @desc    Test Screen
// @access  Private
router.get("/test-rev", (req, res) =>
  res.json({
    msg: "Reviews Works",
  })
);

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
