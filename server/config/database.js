const mongoose = require("mongoose");
require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(()=>console.log("DB connection successfull"))
    .catch((e)=>{ 
        console.log("DB Connection failed");
        console.error(e);
        process.exit(1);
    })
}