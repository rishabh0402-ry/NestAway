const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams is important!
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listings.js");
const Review = require("../models/review.js");
const {isLoggedIn, validateReview, isAuthor } = require("../middleware.js"); 
const  reviewController = require("../controllers/reviews.js")

// Create Review
router.post("/", isLoggedIn,validateReview, wrapAsync(reviewController.createReview));

// Delete Review
router.delete("/:reviewId",isLoggedIn, isAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;
