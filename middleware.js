const Listing = require("./models/listings")
const ExpressError = require("./utils/ExpressError");
const { listingSchema , reviewSchema} = require("./Schema.js");   

module.exports.isLoggedIn = (req,res,next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; 
        req.flash("error","you must be logged in to create listing!");
        return res.redirect("/login");          
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (!req.isAuthenticated() && req.method === "GET" && !req.session.redirectUrl) {
        req.session.redirectUrl = req.originalUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next) => {
        let { id } = req.params;
        let listing = await Listing.findById(id);
        if (!listing.owner.equals(res.locals.currentUser._id)) {
            req.flash("error", "You are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        }
        next();
}

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errorMessage = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errorMessage); 
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    const Review = require("./models/review"); // Import Review model
    let review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
