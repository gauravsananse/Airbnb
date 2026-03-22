const express = require("express");

const mongoose= require("mongoose");
const path=require("path");
const Listing = require("./models/listing.js");
const methodOverride= require("method-override")
const ejsMate = require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js")
const Review = require("./models/review.js");



const app= express();

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
  console.log("MongoDB connected");
}

main()
  .then(() => {
    app.listen(8080, () => {
      console.log("Server running on port 8080");
    });
  })
  .catch(err => {
    console.log("Mongo connection error:", err);
  });









app.get("/",(req,res)=>{
    res.send("hii i am root");
});


const validateListing = (req,res,next)=>{
  let {error} =listingSchema.validate(req.body);
  console.log(result);
  if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
  
}

//server side review validation 
const validateReview = (req,res,next)=>{
  let {error} =reviewSchema.validate(req.body);
  console.log(error);
  if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
  
}
//create route
app.get("/listings",wrapAsync(async(req,res,next)=>{
  try{
    const allListings= await Listing.find({});
  res.render("./listings/index.ejs",{allListings});

  }catch{
    next(err);
  }
  
}));

//new route
app.get("/listings/new",(req,res)=>{
  res.render("listings/new.ejs");
})
 //show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{  //individual show 
    let {id}=req.params;
    const listing = await Listing.findById(id).populate("reviews"); //only we object id but we need data then we use populate
    res.render("listings/show.ejs",{listing});

}));

//create route after new route

app.post("/listings", validateListing,wrapAsync(async(req,res,next)=>{
  let result =listingSchema.validate(req.body);
  
  if(result.err){
    throw new ExpressError(400,result.error);
  }
  const newListing =new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
})
);
//edit route

app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
  let {id}=req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs",{listing});
}));

//update route
app.put("/listings/:id", validateListing,wrapAsync(async(req,res)=>{
let {id}=req.params;
 await Listing.findByIdAndUpdate(id,{...req.body.listing});
 res.redirect(`/listings/${id}`);
}));

//DELETE route

app.delete("/listings/:id", wrapAsync(async(req,res)=>{
  let {id}=req.params;
  let deletedListing = await Listing.findByIdAndDelete(id)
  console.log(deletedListing);
  res.redirect("/listings");
}));


//reivews
app.post("/listings/:id/reviews" ,validateReview,wrapAsync(async(req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save(); 
    res.redirect(`/listings/${listing._id}`);

  
}));

//delete review route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
}))

app.use((req,res,next)=>{
  next(new ExpressError(404,"Page not Found !"));
})

//middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500).render("error.ejs", { err });
});



