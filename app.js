var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));
// app.listen((5000));

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed!");
});

// Elaborating parser
app.get("/parser", function (req, res) {
  
	console.log(req.query.q);
	
	//////////////////	
	//request parsing
	/////////////////
	var tokens = req.query.q.split(' ');
		
	if (tokens.length == 0) {res.send("error: no argument in query");}
	
	//////////////////	
	//token detection
	/////////////////
	
	for (index = 0; index < tokens.length; ++index) {
    
	if (tokens[index].toString() == "m")  { var flag_m = true  ;}
	if (tokens[index].toString() == "m1") { var flag_m1 = true ;}
	if (tokens[index].toString() == "m2") { var flag_m2 = true ;}
	if (tokens[index].toString() == "a0") { var flag_a0 = true ;}
	if (tokens[index].toString() == "a1") { var flag_a1 = true ;}
	if (tokens[index].toString() == "a2") { var flag_a2 = true ;}
	if (tokens[index].toString() == "a3") { var flag_a3 = true ;}
	if (tokens[index].toString() == "b1") { var flag_b1 = true ;}
	if (tokens[index].toString() == "b2") { var flag_b2 = true ;}
	
	console.log(tokens[index].toString());
	
	}
	
	//res.send(req.query);
	
	
	//////////////////	
	//getting data
	/////////////////
	
	var csv = require('csv-array');
	csv.parseCSV("data.csv", function(data){
	//console.log(data);
		
		//////////////////	
		//parsing data
		/////////////////

		var query = require('array-query');	
		var result;
		
		//////////////////
		//par defaut, tri sur la colonne M
		//////////////////
		result = query().sort("M").desc().on(data);
					
		// if (flag_m) 	{ result = query().sort("M").desc().on(data);}
		if (flag_m1)	{ result = query().sort("M1").desc().on(data);}
		if (flag_m2)	{ result = query().sort("M2").desc().on(data);}
		
		var skills = [];
		
		if (flag_a0){skills.push("A0");}
		if (flag_a1){skills.push("A1");}
		if (flag_a2){skills.push("A2");}
		if (flag_a3){skills.push("A3");}
		if (flag_b1){skills.push("B1");}
		if (flag_b2){skills.push("B2");}
		
		console.log(skills);
		
		if (skills.length != 0) {
			result = query("Titre").within(skills).on(result);
		}
		
		//var small_data = query("M1").gt(21).on(data);
		
		//////////////////	
		//sending data
		/////////////////
		
		res.send(result);

	});	
		
	
	
	
});


	
	
	
	

  
	//var parse = require('csv-parse');
	
	//parse(data.toString(), {columns: true},function(err, output){
		
		//res.send(output);
		
		//res.send(output[1]);
		
		//var query = require('array-query');
		//var small_data = query().limit(10).on(output);
		
		//var small_data = query("M1").gt(10).on(output);
		
		//console.log(small_data.toString());
		
		//res.send(small_data);
		
	//});
	

  


// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === "this_is_my_token") {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});