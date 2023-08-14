//jshint es6

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));

app.get("/calBMI", function(req, res){
  res.sendFile(__dirname + "/calBMI.html");
})

app.post("/calBMI", function(req, res){
  var height = parseFloat(req.body.height);
  var weight = parseFloat(req.body.weight);
  var bmi = weight/(height*height);
 res.send("Your BMI is "+ bmi )

})

app.listen(3000, function(){
  console.log("The website started at 3000");
})
