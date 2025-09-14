const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });
const Listing = require("../models/listings.js");

// Search
router.get("/search", async (req, res) => {
  const { country, location } = req.query;
  let query = {};
  if (country) query.country = country;
  if (location) query.location = { $regex: location, $options: "i" };
  const allListings = await Listing.find(query);
  
  // Pass search parameters to template for display
  const searchParams = { country, location };
  const hasSearchParams = country || location;
  
  res.render("listings/index.ejs", { 
    allListings, 
    searchParams, 
    hasSearchParams 
  });
});

// Index + Create
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );
  

// New Form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show + Update + Delete
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing)); // make sure deleteListing exists

// Edit Form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
