require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const port = 3000;

//!------------------------------------------------------------CONNECT-TO-DATABASE--------------------------------------------------------------

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//!encrypting certain field in database
//! .save : encrypts , .find : decrypts
//! must be done before compiling model with schema
const secret = process.env.SECRET;
//*                          ^string for encryption
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});
//*                                                 ^Encrypt Only Certain Fields

const User = mongoose.model("User", userSchema);
//!---------------------------------------------------------------------------------------------------------------------------------------------

//!GET
app.get("/", (req, res) => {
    res.render("home");
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});

//!POST
//*add a user
app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function (err) {
        if(err){
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    //* check for matching username then validate password
    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        }
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));