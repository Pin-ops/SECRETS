//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


const app = express();


console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));


/////////////// CONNECT TO MONGODB (TAKE INTO ACTION MONGOOSE)
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });



//////// CREATE FIRST USER SCHEMA 

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

////////Plugin must be here(before using userSchema)

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

////This encrypyt the entire line but encryptedFiells encrypts only a spesicific thing. 

/////// USE THE SCHEMA IN THE MODULE

const User = new mongoose.model("User", userSchema);

////////////GET ACCESS TO THE MAIN SECTIONS("HOME/LOGIN/REGISTER")//////
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});


///////////////////////////// LEVEL 1 SECURITY ////////////////////////
/// DATABASE OF USERS ///

app.post("/register", (req, res) => {

    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save((err) => {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets") ///if only  user is successfully registered,can see "secrets"page
        };
    });
});


app.post("/login", function(req, res) {


    const username = req.body.username;
    const password = req.body.password;

    //////CHECK IF THIS USER REALLY EXISTS 
    User.findOne({ email: username }, function(err, foundUser) { ////not only the email adress
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) { // also the password must be the same with the database.
                    res.render("secrets");
                }
            }
        }
    });
});







app.listen(3000, function() {
    console.log("Server started on port 3000.");
});