const mongoose = require('mongoose');

  async function connectDB(){
  await  mongoose.connect(process.env.DB_URI||process.env.MONGO_URL)
  .then(()=>{
    console.log("Data base connected successfully")
  }).catch((err)=>{
    console.log("data base connection error in db.js",err.message)
  })
}


module.exports = { connectDB};