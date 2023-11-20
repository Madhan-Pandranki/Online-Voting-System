const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    Email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    Mobile_no : {
        type : Number,
        required : true,
        unique : true
    },
    Address : {
        type : String,
        required : true
    }
})

//Create collection
const Signup = new mongoose.model("Signup", registerSchema);

module.exports = Signup;