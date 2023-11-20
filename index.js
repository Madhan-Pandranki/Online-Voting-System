const path = require("path");
const express = require("express");
const methodOverride = require('method-override');
const { flash } = require("express-flash-message");
const session = require("express-session");
const app = express();
var adminjson;

//Connect Database
require('./db');
const Signup = require("./models/signup");
const Position = require("./models/positions");
const Candidate = require("./models/candidates");
const Castvote = require("./models/castvotes");
const Feedback = require("./models/feedbacks");
const { CLIENT_RENEG_LIMIT } = require("tls");
const { set } = require("mongoose");

const port = process.env.PORT || 8000;

//Define paths for Express config
const publicDirectoryPath = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './templates');

//Setup Handlebars engine and views location
app.set('view engine', 'ejs');
app.set('views', viewsPath);

//Setup Static directory to serve
app.use(express.static(publicDirectoryPath));

app.use(methodOverride('_method'))
app.use(express.json());
app.use(express.urlencoded({extended : false}));

app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, //1Week
        },
    })
);
app.use(flash({ sessionKeyName: "flashMessage" }));

//Display Pages
app.get("/",(req,res)=>{
    res.render('index');
});
app.post("/", async(req,res)=>{
    const data = new Feedback({
        Name : req.body.Name,
        Email : req.body.Email,
        Mobile_No : req.body.Mobile_No,
        Message : req.body.Message
    });
    // console.log(data);
    const fb = await data.save();
    res.status(201).render('index');
})

app.get("/login", async(req,res)=>{
    const messages = await req.consumeFlash("info");
    // console.log(messages);
    res.render('login',{messages});
});

app.get("/signup",async(req,res)=>{
    const messages = await req.consumeFlash("info");
    res.render('signup',{messages});
});

//Admin Dashboard
app.get("/admin_dashboard/:id", async (req,res)=>{
    const positions = Position.find({})
    .then((positions)=>{
        const candidates = Candidate.find({})
        .then((candidates)=>{
            const voters = Signup.find({Email:{$ne:"qwerty@gmail.com"}})
            .then((voters)=>{
                var positions_size = positions.length;
                let candidates_size = candidates.length;
                let voters_size = voters.length;
                res.render('admin_dashboard',{adminjson,positions_size,candidates_size,voters_size});
            })
        })
    })
    
});

//CRUD for Positions
app.get("/crud_positions/:id", async (req,res)=>{
    const positions = Position.find({})
    .then((positions)=>{
        res.render('crud_positions',{adminjson,positions});
    })
    .catch(()=>{
        res.send("ERROR!")
    })
});
app.get("/add_position/:id", async (req,res)=>{
    const messages = await req.consumeFlash("info");
    res.render('positions/add_position',{adminjson,messages});
});
app.get("/edit_position/:id", async (req,res)=>{
    let pos = await Position.findOne({_id : req.params.id})
    const messages = await req.consumeFlash("info");
    res.render('positions/edit_position',{adminjson,pos,messages});
});

//CRUD for Candidates
app.get("/crud_candidates/:id", async (req,res)=>{
    const candidates = Candidate.find({})
    .then((candidates)=>{
        res.render('crud_candidates',{adminjson,candidates});
    })
    .catch(()=>{
        res.send("ERROR!")
    })
});
app.get("/add_candidate/:id", async (req,res)=>{
    const messages = await req.consumeFlash("info");
    res.render('candidates/add_candidate',{adminjson,messages});
});
app.get("/edit_candidate/:id", async (req,res)=>{
    let cand = await Candidate.findOne({_id : req.params.id})
    const messages = await req.consumeFlash("info");
    res.render('candidates/edit_candidate',{adminjson,cand,messages});
});

//CRUD for Voters
app.get("/crud_voters/:id", async (req,res)=>{
    const voters = Signup.find({Email:{$ne:"qwerty@gmail.com"}})
    .then((voters)=>{
        res.render('crud_voters',{adminjson,voters});
    })
    .catch(()=>{
        res.send("ERROR!")
    })
});
app.get("/add_voter/:id", async (req,res)=>{
    const messages = await req.consumeFlash("info");
    res.render('voters/add_voter',{adminjson,messages});
});
app.get("/edit_voter/:id", async (req,res)=>{
    let v = await Signup.findOne({_id : req.params.id})
    const messages = await req.consumeFlash("info");
    res.render('voters/edit_voter',{adminjson,v,messages});
});

//Results
app.get("/results/:id", async (req,res)=>{
    const results = Candidate.find({})
    .then((results)=>{
        res.render('results',{adminjson,results});
    })
    .catch(()=>{
        res.send("ERROR!")
    })
});
app.put("/results/:id", async (req,res)=>{
    try {
        const p = await Candidate.findByIdAndUpdate(req.params.id);
        // console.log(p)
        const samepos = p.Position;
        // console.log(samepos)
        const pos = await Candidate.find({Position : samepos})
        .then((pos)=>{
            pos.forEach(element => {
                if(element.ResultSend === false)
                {
                    element.ResultSend = true;
                    const c = element.save();
                }
                else{
                    element.ResultSend = false;
                    const c = element.save();
                }
            });
            // console.log(pos)
    
        })        
        res.redirect(`/results/${adminjson._id}`)
    } catch (error) {
        res.status(400).send(error);
    }
});
//Result Graph
app.get("/admin_resultgraph/:id", async (req,res)=>{
    const voter = await Signup.findOne({_id : req.params.id})
    .then((voter)=>{
        const results = Candidate.find({})
        .then((results)=>{
            // console.log(results)
            const distinctpos = [...new Set(results.map(i => i.Position))]
            // console.log(distinctpos)
            // let c = results.filter(j=>{ return j.Position === 'PM'; })
            // console.log(c)
            res.render('admin_resultgraph',{adminjson,results,distinctpos});
        })
    })  
    .catch(()=>{
        res.send("ERROR!")
    })
})

//Feedbacks
app.get("/feedbacks/:id", async (req,res)=>{
    try {
        const feedbacks = await Feedback.find({});
        res.render("feedbacks",{adminjson,feedbacks});
    } catch (error) {
        res.send(error);
    }
})

//Voter Dashboard
app.get("/voter_dashboard/:id", async (req,res)=>{
    const messages = await req.consumeFlash("info");
    const voter = await Signup.findOne({_id : req.params.id})
    .then((voter)=>{
        const cv = Castvote.find({VoterId : req.params.id})
        .then((cv)=>{
            const cvdistinctpos = [...new Set(cv.map(item => item.PositionId))];
            // console.log(cvdistinctpos)
            // const res = Candidate.find({ResultSend : false})
            const distpos = Candidate.find({ResultSend : false}).distinct('Position')
            .then((distpos)=>{
                // console.log(distpos)
                const distinctpos = distpos.filter(element => !cvdistinctpos.includes(element))
                const cand = Candidate.find({})
                .then((cand)=>{
                    res.render('voter_dashboard',{voter,distinctpos,cand,messages});
                })
            })
        })
    })
    .catch(()=>{
        res.send("ERROR!")
    })
});
app.put("/voter_dashboard/:id", async (req,res)=>{
    try {
        const p = await Candidate.findByIdAndUpdate(req.body.candradio);
        if(p)
        {
            p.Count += 1;
    
            const c = await p.save();
            // const rad = p.id
            // console.log(rad)
            const data = new Castvote({
                VoterId : req.params.id,
                PositionId : p.Position
            });
    
            const cv = await data.save();
            await req.flash("info", `Voted successfully for Position : ${p.Position}`);
            res.redirect(`/voter_dashboard/${req.params.id}`)
        }
        else{
            // res.send("select one")
            await req.flash("info", "Select one candidate!! Try Again");
            res.redirect(`/voter_dashboard/${req.params.id}`);
        }
    } catch (error) {
        res.status(400).send(error);
    }
});
//Display results to voters
app.get("/voter_results/:id", async (req,res)=>{
    const voter = await Signup.findOne({_id : req.params.id})
    const results = Candidate.find({ResultSend : true})
    .then((results)=>{
        res.render('voter_results',{voter,results});
        // console.log(results)
    })
    .catch(()=>{
        res.send("ERROR!")
    })
})
//Result Graph
app.get("/resultgraph/:id", async (req,res)=>{
    const voter = await Signup.findOne({_id : req.params.id})
    .then((voter)=>{
        const results = Candidate.find({ResultSend : true})
        .then((results)=>{
            // console.log(results)
            const distinctpos = [...new Set(results.map(i => i.Position))]
            // console.log(distinctpos)
            // let c = results.filter(j=>{ return j.Position === 'PM'; })
            // console.log(c)
            res.render('resultgraph',{voter,results,distinctpos});
        })
    })
    // const results = await Candidate.find({ResultSend : true, Position : "CM"})
    // .then((results)=>{
    //     // console.log(results)
    //     var xValues = results.map(i=>i.Party)
    //     // console.log(xValues)
    //     var yValues = results.map(i=>i.Count)
    //     // console.log(yValues)

    //     res.render('resultgraph',{
    //         voter,
    //         xValues : JSON.stringify(xValues),
    //         yValues : JSON.stringify(yValues)
    //     });

    // })   
    .catch(()=>{
        res.send("ERROR!")
    })
})

//create new user in our database if we signup
app.post("/signup", async (req,res)=>{
    try {
        const check = await Signup.findOne({Email : req.body.Email} || {Mobile_no : req.body.Mobile_no})
        if(!check)
        {
            const data = new Signup({
                name : req.body.name,
                Email : req.body.Email,
                password : req.body.password,
                Mobile_no : req.body.Mobile_no,
                Address : req.body.Address
            });
    
            const signedup = await data.save();
            res.status(201).render('login');
        }
        else{
            // res.send("Email/Mobile Number already exists!!");
            await req.flash("info", "Email/Mobile Number already exists!! Try Again");
            res.redirect('/signup');
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

//check for login credentials in database
app.post("/login", async (req,res)=>{
    try {
        const admin = await Signup.findOne({Email : "qwerty@gmail.com"});
        const check = await Signup.findOne({Email : req.body.Email});
        if(check)
        {
            if(check.Email == admin.Email && admin.password == req.body.password)
            {
                // res.send("Admin Dashboard");
                adminjson = admin;
                res.redirect(`/admin_dashboard/${adminjson._id}`);
            }
            else if(check.password == req.body.password)
            {
                // res.send("Voter Dashboard");
                res.redirect(`/voter_dashboard/${check._id}`);
            }
    
            else{
                // res.status(400).send("Wrong Credentials");
                await req.flash("info", "Wrong Credentials!! Try Again");
                res.redirect('/login');
            }
        }
        else{
            // res.send("User not found")
            await req.flash("info", "User not found!! Try Again");
            res.redirect('/login');
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

//Add new Position
app.post("/add_position/:id", async (req,res)=>{
    try {
        const check = await Position.findOne({Position : req.body.Position})
        if(!check)
        {
            const data = new Position({
                Position : req.body.Position,
                Info : req.body.Info 
            });
    
            const pos = await data.save();
            res.redirect(`/crud_positions/${adminjson._id}`);
        }
        else{
            // res.send("Position already exists!!");
            await req.flash("info", "Position already exists!! Try Again");
            res.redirect(`/add_position/${adminjson._id}`);
        }
    } catch (error) {
        res.status(400).send(error);
    }
});
//Edit Position
app.put("/edit_position/:id", async (req,res)=>{
    try {
        // const check = await Position.findOne({Position : req.body.Position })
        // if(!check)
        // {
            const p = await Position.findByIdAndUpdate(req.params.id);
            p.Info = req.body.Info;
        
            const c = await p.save();
            res.redirect(`/crud_positions/${adminjson._id}`)
            
        // }
        // else{
            // res.send("Position already exists!!");
        // }
    } catch (error) {
        res.status(400).send(error);
    }
});
//Delete Position
app.delete("/edit_position/:id", async (req, res) => {
    try {
        const pos = await Position.findOne({_id:req.params.id})
        // console.log(pos.Position)
        await Candidate.deleteMany({Position : pos.Position})
        await Position.deleteOne({_id:req.params.id });
        res.redirect(`/crud_positions/${adminjson._id}`)
    } catch (err) {
        console.log(err);
    }
});

//Add new Candidate
app.post("/add_candidate/:id", async (req,res)=>{
    try {
        const check = await Candidate.findOne({Party : req.body.Party , Position : req.body.Position});
        if(!check)
        {
            const data = new Candidate({
                Name : req.body.Name,
                Position : req.body.Position,
                Party : req.body.Party,
                Info : req.body.Info,
            });
            const poscheck = await Position.findOne({Position : req.body.Position})
            if(poscheck)
            {
                const cand = await data.save();
                res.redirect(`/crud_candidates/${adminjson._id}`);
            }
            else
            {
                // res.send("Position doesn't exists!!");
                await req.flash("info", "Position doesn't exists!! Try Again");
                res.redirect(`/add_candidate/${adminjson._id}`);
            }
        }
        else{
            // res.send("Already exists!!");
            await req.flash("info", "Party already exists!! Try Again");
            res.redirect(`/add_candidate/${adminjson._id}`);
        }
    } catch (error) {
        res.status(400).send(error);
    }
});
//Edit Candidate
app.put("/edit_candidate/:id", async (req,res)=>{
    try {
        // const check = await Position.findOne({Position : req.body.Position })
        // if(!check)
        // {
            const p = await Candidate.findByIdAndUpdate(req.params.id);
            p.Name = req.body.Name,
            p.Info = req.body.Info

            const candcheck = await Position.findOne({Position : req.body.Position})
            if(candcheck)
            {
                const cand = await p.save();
                res.redirect(`/crud_candidates/${adminjson._id}`);
            }
            else
            {
                res.send("Position doesn't exists!!");
            }
            
        // }
        // else{
            // res.send("Position already exists!!");
        // }
    } catch (error) {
        res.status(400).send(error);
    }
});
//Delete Candidate
app.delete("/edit_candidate/:id", async (req, res) => {
    try {
        await Candidate.deleteOne({_id:req.params.id });
        res.redirect(`/crud_candidates/${adminjson._id}`)
    } catch (err) {
        console.log(err);
    }
});

//Add New Voter
app.post("/add_voter/:id", async (req,res)=>{
    try {
        const check = await Signup.findOne({Email : req.body.Email} || {Mobile_no : req.body.Mobile_no})
        if(!check)
        {
            const data = new Signup({
                name : req.body.name,
                Email : req.body.Email,
                password : req.body.password,
                Mobile_no : req.body.Mobile_no,
                Address : req.body.Address
            });
    
            const signedup = await data.save();
            res.redirect(`/crud_voters/${adminjson.id}`);
        }
        else{
            // res.send("Voter already exists!!");
            await req.flash("info", "Voter already exists!! Try Again");
            res.redirect(`/add_voter/${adminjson._id}`);
        }
    } catch (error) {
        res.status(400).send(error);
    }
});
//Edit Voter
app.put("/edit_voter/:id", async (req,res)=>{
    try {
        // const check = await Position.findOne({Position : req.body.Position })
        // if(!check)
        // {
            const p = await Signup.findByIdAndUpdate(req.params.id);
            p.name = req.body.name,
            p.password = req.body.password,
            p.Address = req.body.Address

            const v = await p.save();
            res.redirect(`/crud_voters/${adminjson._id}`);
            
        // }
        // else{
            // res.send("Position already exists!!");
        // }
    } catch (error) {
        res.status(400).send(error);
    }
});
//Delete Voter
app.delete("/edit_voter/:id", async (req, res) => {
    try {
        await Signup.deleteOne({_id:req.params.id });
        res.redirect(`/crud_voters/${adminjson._id}`)
    } catch (err) {
        console.log(err);
    }
});

//Listening Server
app.listen(port, ()=>{
    console.log(`Server started on Port ${port} Successfully......`);
});


