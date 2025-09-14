const Listing = require("../models/listings.js"); 
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async (req, res, next) => {
  try {
    const allListings = await Listing.find({}).maxTimeMS(30000); // 30 second timeout
    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    console.error("Error fetching listings:", err);
    next(err);
  }
}

module.exports.renderNewForm =  (req, res) => {
  res.render("listings/new.ejs");
}

module.exports.createListing = async (req, res, next) => {
  try {
    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    })
     .send();

    let url = req.file.path;
    let filename = req.file.filename;
    // Create a new listing using the data from the form
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Assuming req.user contains the logged-in user's info
    newListing.image = { url, filename }; 
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing); 
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
  } catch (err) {
    console.error("Error creating listing:", err);
    next(err);
  }
}

module.exports.showListing = async (req, res, next) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({path: "reviews", populate: {path: "author"}})
      .populate("owner")
      .maxTimeMS(30000); // 30 second timeout
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    console.error("Error fetching listing:", err);
    next(err);
  }
}

module.exports.editListing = async (req, res, next) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id).maxTimeMS(30000);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    console.error("Error fetching listing for edit:", err);
    next(err);
  }
}

// Route file expects `renderEditForm`; provide it as an alias to `editListing`
module.exports.renderEditForm = async (req, res, next) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id).maxTimeMS(30000);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/,w_250"); // Resize for display

    res.render("listings/edit.ejs", { listing , originalImageUrl});
  } catch (err) {
    console.error("Error fetching listing for edit form:", err);
    next(err);
  }
}

module.exports.updateListing = async (req, res, next) => {
  try {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }).maxTimeMS(30000);
   
    if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename }; 
      await listing.save();
    }   
    
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("Error updating listing:", err);
    next(err);
  }
}

module.exports.deleteListing = async (req, res, next) => {
  try {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id).maxTimeMS(30000);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
  } catch (err) {
    console.error("Error deleting listing:", err);
    next(err);
  }
}