const Listing = require("../models/listing");
 //index route
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  };

//New Route
module.exports.renderNewForm =  (req, res) => {
  console.log(req.user);
  res.render("listings/new.ejs");
};

//show route
module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
    .populate({
      path : "reviews",
      populate : {
        path : "author",
      },
      })
      .populate("owner");
    if(!listing){
      req.flash("error", "Listing is not exist");
      return res.redirect("/listings");
    }

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show.ejs", { listing });
  };

  //create route

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
  };

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);
     if(!listing){
      req.flash("error", "Listing is not exist");
      return res.redirect("/listings");
    }

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl.replace("/upload","/upload/h_300,w_250")
    res.render("listings/edit.ejs", { listing });
  };

//update route

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    
    let listing =await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file!=="undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    }
    req.flash("success", "Listing is Updated");

    res.redirect(`/listings/${id}`);
  };

//delete route

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted");

    res.redirect("/listings");
  };
