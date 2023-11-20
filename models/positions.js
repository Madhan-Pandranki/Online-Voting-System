const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    Position : {
        type : String,
        required : true,
        unique : true
    },
    Info : {
        type : String,
        required : true
    }
})

//Create collection
const Position = new mongoose.model("Position", positionSchema);

module.exports = Position;