const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
    VoterId : {
        type : String,
        required : true
    },
    PositionId : {
        type : String,
        required : true
    }
})

//Create collection
const Castvote = new mongoose.model("Castvote", cvSchema);

module.exports = Castvote;