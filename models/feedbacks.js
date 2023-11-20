const mongoose = require('mongoose');

const fbSchema = new mongoose.Schema({
    Name : {
        type : String,
        required : true
    },
    Email : {
        type : String,
        required : true
    },
    Mobile_No : {
        type : Number,
        required : true
    },
    Message : {
        type : String,
        required : true
    }
})

//Create collection
const Feedback = new mongoose.model("Feedback", fbSchema);

module.exports = Feedback;