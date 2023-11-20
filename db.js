const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/OnlineVotingSystem')
.then(()=>{
    console.log("Database Connected Successfully....");
}).catch(()=>{
    console.log("Database Connection Failed!!!");
})