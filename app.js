//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var encrypt = require('mongoose-encryption');


const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


const mongoDB = "mongodb://127.0.0.1:27017/secretsDB";

// Wait for database to connect, logging an error if there is a problem
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB, {useNewUrlParser: true});
  console.log("Database connected successfully");
}

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = mongoose.model('user', userSchema);

const Secret = mongoose.model("secret",{
  secret: String
});

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", async function(req, res){
  console.log(req.body.username);
  try{
    const user = await User.findOne({username: req.body.username})
    console.log(user);
    if(user != null){
      if(user.password != req.body.password)
      {
        res.send("incorrect password");
      }
      else{
        res.redirect("/secrets");
      }
    } else {
      res.send("user does not exist");
    }
  } catch(err) {
    console.log(err);
  }
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", async function(req, res){

  const user = await User.findOne({username: req.body.username})
  if(user == null){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })
  try{
    await user.save();
    res.redirect("/secrets");
  } catch(err){
    console.log("error registering user");
  }
} else {
  res.redirect("/login");
}
});

app.get("/secrets", async function(req, res){
  try{
    const secrets = await Secret.find();
    res.render("secrets", {allSecrets: secrets});
  } catch(err){
    console.log("error in finding secrets");
  }
})

app.get("/submit", function(req, res){
  res.render("submit");
});

app.post("/submit", async function(req, res){
  const secret = new Secret({
    secret: req.body.secret
  });

  try{
    await secret.save();
    res.redirect("secrets");
  } catch(err){
    console.log("error saving secret");
  }

});

app.get("/logout", function(req, res){
  res.redirect("/");
});


app.listen(3000, function(){
  console.log("Server started at port 3000");
});
