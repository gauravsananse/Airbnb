const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to DB");
  await initDB();
}


main().catch((err) => console.log(err));

const initDB = async () => {
  await Listing.deleteMany({});

  // add owner to each listing
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId("69c98d55a067cdc8504ab2cc"),
  }));

  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
