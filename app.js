//jshint esversion:6

require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// var encrypt = require('mongoose-encryption');
// var md5 = require('md5');
// console.log(md5("1234"));
const bcrypt = require("bcrypt");
const saltRounds = 10;
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded(
{
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userData",
{
  useUnifiedTopology: true,
  useNewUrlParser: true
});


const credentials = new mongoose.Schema(
{
  email:
  {
    type: String,
    required: true
  },
  password:
  {
    type: String,
    required: true
  }
});


// credentials.plugin(encrypt,{secret:process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", credentials);

app.get("/", (req, res) =>
{
  res.render("home");
});

app.route("/login")
  .get((req, res) =>
  {
    res.render("login");
  })
  .post((req, res) =>
  {
    const userN = req.body.username;
    const userP = req.body.password;
    User.findOne(
    {
      email: userN,
    }, (err, user) =>
    {
      if (err)
        res.send(err);
      else
      {
        if (user)
          bcrypt.compare(userP, user.password, function(err, result)
          {
            result==true?res.render("Secrets"):res.send("<h1>you are not registered</h1>");
          });
      }
    });

  });

app.route("/register")
  .get((req, res) =>
  {
    res.render("register");
  })
  .post((req, res) =>
  {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash)
    {
      const newUser = new User(
      {
        email: req.body.username,
        password: hash
      });
      newUser.save((err) =>
      {
        if (err)
          console.log(err);
        else
          res.render("secrets");
      });
    });
  });

// app.get("/secrets", (req, res) =>
// {
//   res.render("secrets");
// });

app.get("/submit", (req, res) =>
{
  res.render("submit");
});




app.listen(3000, console.log("started"));
