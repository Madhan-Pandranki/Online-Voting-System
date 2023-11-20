const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    Name : {
        type : String,
        required : true
    },
    Position : {
        type : String,
        required : true
    },
    Party : {
        type : String,
        required : true
    },
    Info : {
        type : String,
        required : true
    },
    Count : {
        type : Number,
        default : 0,
        required : true
    },
    ResultSend : {
        type : Boolean,
        default : false,
        require : true
    }
})

//Create collection
const Candidate = new mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;