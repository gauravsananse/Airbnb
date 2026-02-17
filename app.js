const express = require("express");
const app= express();
const mongoose= require("mongoose");
const path=require("path");
const Listing = require("./models/listing.js");

//creating database using mongoose and connection of mongoose

// main()
//     .then(()=>{
//         console.log("connection successful");
//     }).catch((err)=>{
//         console.log(err);
//     });

// async function main(){
//     await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
// }


async function main() {
  await mongoose.connect("mongodb+srv://gaurav:7798521471@cluster0.byrlu40.mongodb.net/?appName=Cluster0");
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




app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended : true}));


// app.listen(8080,(req,res)=>{
//     console.log("app is listening at port 8080..");
// });

app.get("/",(req,res)=>{
    res.send("hii i am root");
});

app.get("/listings",async(req,res)=>{
  const allListings= await Listing.find({});
  res.render("./listings/index.ejs",{allListings});
});


app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});


})

// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({  //new document
//         title : "My new Villa",
//         description : "By the beach",
//         price : 1200,
//         location : "Calangute Goa",
//         country : "India",
//     });
//     await sampleListing.save()
//     console.log("sample was saved");
//     res.send("successful testing");
    
// });