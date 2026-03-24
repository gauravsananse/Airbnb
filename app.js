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
const listings= require("./routes/listing.js");
const reviews= require("./routes/review.js");



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






app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);




app.use((req,res,next)=>{
  next(new ExpressError(404,"Page not Found !"));
})

//middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500).render("error.ejs", { err });
});



