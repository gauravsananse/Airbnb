const express = require("express");

const mongoose= require("mongoose");
const path=require("path");
const Listing = require("./models/listing.js");
const methodOverride= require("method-override")
const ejsMate = require("ejs-mate");


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

app.get("/listings",async(req,res)=>{
  const allListings= await Listing.find({});
  res.render("./listings/index.ejs",{allListings});
});

//new route
app.get("/listings/new",(req,res)=>{
  res.render("listings/new.ejs");
})
 //show route
app.get("/listings/:id",async(req,res)=>{  //individual show 
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});

})

//create route after new route

app.post("/listings",async(req,res)=>{
  // let{title,description,image,price,country,location}=req.body; //this is too long for short make object listing[title]...in new.ejs
  const newListing= new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
})

//edit route

app.get("/listings/:id/edit",async(req,res)=>{
  let {id}=req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs",{listing});
})

//update route
app.put("/listings/:id", async(req,res)=>{
  let {id}=req.params;
 await Listing.findByIdAndUpdate(id,{...req.body.listing});
 res.redirect(`/listings/${id}`);
})

//DELETE route

app.delete("/listings/:id", async(req,res)=>{
  let {id}=req.params;
  let deletedListing = await Listing.findByIdAndDelete(id)
  console.log(deletedListing);
  res.redirect("/listings");
});


