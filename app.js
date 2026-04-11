if(process.env.NODE_ENV !="production"){
  require('dotenv').config();
}


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
const listingRouter= require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const { MongoStore } = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy= require("passport-local");
const User = require("./models/user.js")



const app= express();

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const dns = require("dns");
dns.setServers(["1.1.1.1", "0.0.0.0"]);

const dbUrl = process.env.ATLASDB_URL;

const store= MongoStore.create({
  mongoUrl : dbUrl,
  crypto : {
    secret : process.env.SECRET,
  },
  touchAfter : 24*3600,
});

store.on("error",(err)=>{
  console.log("Error in mongo session store",err)
});

const sessionOptions= {
  store,
  secret : process.env.SECRET,
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 7 *24*60*60*1000, //after a 1 week
    maxAge : 7 *24*60*60*1000,
    httpOnly : true,
  }
}

// app.get("/",(req,res)=>{
//     res.send("hii i am root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //if we are going from one page to another then no need to login again
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.set("strictPopulate", false); 

main()
  .then(() => {
    app.listen(8080, () => {
      console.log("Server running on port 8080");
    });
  })
  .catch(err => {
    console.log("Mongo connection error:", err);
  });


async function main() {
  await mongoose.connect(dbUrl);
  console.log("MongoDB connected");
}








app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error =  req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//pdkdf is the algorithm we using for hashing

// app.get("/demouser" , async(req,res) => {
//   let fakeUser= new User({
//     email : "student@gmail.com",
//     username : "delta-student"
//   });
//  let registeredUser = await User.register(fakeUser, "helloworld");
//  res.send(registeredUser);
// });
  

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);




app.use((req,res,next)=>{
  next(new ExpressError(404,"Page not Found !"));
})

//middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500).render("error.ejs", { err });
});



