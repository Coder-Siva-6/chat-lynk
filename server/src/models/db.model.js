const mongoose = require('mongoose');
const { type } = require('os');

//  Message Sub-schema with timestamps
const messageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true
    },
    text: {
      type: String
    }
  },
  { timestamps: true }
);




//  Contact Sub-schema with messages array + timestamps
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: ""
    },
    phone: {
      type: Number,
      required: true
    }, 
    profilePicture: {
    data: {type:Buffer},
    contentType:  { type: String },
    
    
  },
    message: [messageSchema]
  },
  { timestamps: true }
);




//  Main User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String
    },
    email: {
      required: true,
      type: String,
      unique: true
    },
    phone: {
      required: true,
      type: Number,
      unique: true
    },
    password: {
      required: true,
      type: String
    },
    profilePicture: {
    data: {type:Buffer},
    contentType:  { type: String },
    
    
  },
  isOnline:{
    type:String,
    default:'false'
  },
    contacts: [contactSchema]
  },
  { timestamps: true }
);



const User = mongoose.model('user',userSchema)


module.exports = User ;