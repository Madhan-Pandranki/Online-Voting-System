const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://madhanp0503:Madhanp@ovs.8gsyyaf.mongodb.net/?retryWrites=true&w=majority&appName=ovs')
.then(()=>{
    console.log("Database Connected Successfully....");
}).catch((e) => {
    console.log(e)
    console.log("Database Connection Failed!!!");
})