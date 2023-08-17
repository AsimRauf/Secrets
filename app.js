//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require('passport');
const passportMongoose = require('passport-local-mongoose');
const session = require("express-session");



const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
  secret: "Thisismysecretcode",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

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

userSchema.plugin(passportMongoose);



const User = mongoose.model('user', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const Secret = mongoose.model("secret",{
  secret: String
});

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.post('/login', passport.authenticate('local', { failureRedirect: "/login" }),  function(req, res) {
	console.log(req.user)
	res.redirect('/secrets');
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", async function(req, res){
  const { username, password } = req.body;
  User.register({username: username}, password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register")
    } else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      });
    }
  });
});


app.get("/secrets", async function(req, res){
  if(req.isAuthenticated()){
    try{
      const secrets = await Secret.find();
      res.render("secrets", {allSecrets: secrets});
    } catch(err){
      console.log("error in finding secrets");
    }
  }
  else{
    res.redirect("/login");
  }

});

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

app.get('/logout', function(req, res, next){
  req.logOut(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});


app.listen(3000, function(){
  console.log("Server started at port 3000");
});
