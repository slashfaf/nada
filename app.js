var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));   // allow dynamic port allocation; required for Heroku hosting

// Server index page
app.get("/", function (req, res) {
  //res.send("deployed!");
  
  response = "Coucou Guillemot!" //Default response from the webhook to show it's working
  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  res.send(JSON.stringify({ "speech": response, "displayText": response 
  //"speech" is the spoken version of the response, "displayText" is the visual version
  }));
  
  //res.sendFile(__dirname+'/simple.html');
  
});

app.post("/", function (req, res) {
  
  // on extrait l'intent reçu de dialogflow
  let intent = req.body.result.metadata.intentName; // nom de l'intent
  response = "intent reçu : " + intent; 

  // on route vers le bon traitement
  
switch(intent) {
    
	case "Pingouin":
        response = "Les guillemots parlent aux pingouins en dur dans le code";
        break;
    
	// l'utilisateur veut connnaitre les dispos des consultants
	case "i_dispo" :
        response = "i_dispo en dur dans le code";
        break;
		
	// l'utilisateur veut connnaitre les chiffres de la prod
	case "i_prod" :
        response = "i_prod en dur dans le code";
        break;
    
	default:
        response = "Vous pouvez répéter la question ?";
}

  
  //let prenom  = req.body.result.parameters['prenom']; // city is a required param
  //response = "Coucou Pingouin " + prenom + " !" 
  
  
 
  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  res.send(JSON.stringify({ "speech": response, "displayText": response 
  //"speech" is the spoken version of the response, "displayText" is the visual version
  }));
  
 
  
});

// Elaborating parser
app.get("/parser", function (req, res) {
  
  	//////////////////	
	//request parsing
	/////////////////
	
	try{ 
	
	var tokens = req.query.q.split(' ');
	
	console.log(" ");
	console.log("  -- starting parser -- ");
	console.log("parser was invoked with following parameters: " + req.query.q.toString());

	//////////////////	
	//token conversion to lower case strings
	/////////////////
	
	var tokens_lower_case = [];
	
	for (i = 0; i < tokens.length; ++i) {
		tokens_lower_case.push(tokens[i].toString().toLowerCase());
	}
	console.log("tokens lower case: "+tokens_lower_case);
	
	//////////////////	
	//token detection
	/////////////////
	
	
	var flag_m ;   // set to true if the key word "m"  or "M" is in the query
	var flag_m1 ;  // set to true if the key word "m1" or "M1" is in the query
	var flag_m2 ;  // set to true if the key word "m2" or "M2" is in the query
	var flag_a0 ;  // set to true if the key word "a0" or "A0" is in the query
	var flag_a1 ;  // set to true if the key word "a1" or "A1" is in the query
	var flag_a2 ;  // set to true if the key word "a2" or "A2" is in the query
	var flag_a3 ;  // set to true if the key word "a3" or "A3" is in the query
	var flag_b1 ;  // set to true if the key word "b1" or "B1" is in the query
	var flag_b2 ;  // set to true if the key word "b2" or "B2" is in the query
	
	var non_key_words = [] ;  	// all the words of the query which are not keywords
	var skills = []; 			// all the key words concerning skills (A0, A1...)
		
	for (index = 0; index < tokens_lower_case.length; ++index) {
    
		
		if ((tokens_lower_case[index].toString() == "m"))   { var flag_m = true  ;}
		else {
		if ((tokens_lower_case[index].toString() == "m1")) { var flag_m1 = true ;}
		else {
		if ((tokens_lower_case[index].toString() == "m2")) { var flag_m2 = true ;}
		else {
		if ((tokens_lower_case[index].toString() == "a0")) { var flag_a0 = true ; skills.push("a0");}
		else {
		if ((tokens_lower_case[index].toString() == "a1")) { var flag_a1 = true ; skills.push("a1");}
		else {
		if ((tokens_lower_case[index].toString() == "a2")) { var flag_a2 = true ; skills.push("a2");}
		else {
		if ((tokens_lower_case[index].toString() == "a3")) { var flag_a3 = true ; skills.push("a3");}
		else {
		if ((tokens_lower_case[index].toString() == "b1")) { var flag_b1 = true ; skills.push("b1");}
		else {
		if ((tokens_lower_case[index].toString() == "b2")) { var flag_b2 = true ; skills.push("b2");}
		else {
			non_key_words.push(tokens_lower_case[index].toString());
		}}}}}}}}}
		
		console.log("word detected in request:" + tokens_lower_case[index].toString());
			
	}
	
	//////////////////
	// just for debug...
	//////////////////
	console.log("non key words detected in request:" + non_key_words);
	console.log("skills detected in request:" + skills);
	
	
	//////////////////	
	//getting data
	/////////////////
	
	var csv = require('csv-array');
	csv.parseCSV("data.csv", function(data){
	//console.log(data);
		
		
		//////////////////	
		//parsing raw data
		/////////////////

		var query = require('array-query');	
		var result;
		
		//////////////////
		//sorting data : by defaut, descending sort on currenth month
		//////////////////
		result = query().sort("m").desc().on(data);
		if (flag_m1)	{ result = query().sort("m1").desc().on(data);}
		if (flag_m2)	{ result = query().sort("m2").desc().on(data);}
		
		
		//////////////////
		//filtering data on skills
		//////////////////
		if (skills.length != 0) {
			result = query("titre").within(skills).on(result);
		}
		
		//////////////////
		//filtering data with non key fields as plain text query
		//////////////////
		if (non_key_words.length != 0) {

			buffer = result ;
			
			/////////////////
			// we search for the keyword in all the "Tri" column
			/////////////////
			
			/////////////////
			// convert the non key words in a search string 
			/////////////////
			
			var non_key_words_as_string = non_key_words[0].toString(); //
			for (j = 1; j < non_key_words.length; ++j) {
				non_key_words_as_string = non_key_words_as_string + " " + non_key_words[j];
			}
			
			console.log("non key words as string: " + non_key_words_as_string);
			result = query("rd").search(non_key_words_as_string).or("nom").search(non_key_words_as_string).or("trg").search(non_key_words_as_string).on(result);
					
		}
		
	
		/////////////////	
		//sending output 
		/////////////////
	
		res.send(result);

	});	
		
	
	
	
	
		
	}
	
	catch (err) {	
	console.log("error: can not proces request");
	res.send("error: can not proces request");
	}
	
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