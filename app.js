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

// Fonction principale invoquée par DialogFlow
app.post("/", function (req, res) {
  
  function send_response (response){
	res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
	res.send(JSON.stringify({ "speech": response, "displayText": response 
	}));
  }
  
  // on extrait l'intent reçu de dialogflow
  let intent = req.body.result.metadata.intentName; // nom de l'intent

  // on route vers le bon traitement
  
switch(intent) {
    
	case "Pingouin":
		r = "Les guillemots parlent aux pingouins en dur dans le code";
		send_response(r);
		break;
    
	// l'utilisateur veut connnaitre les dispos des consultants
	case "i_dispo" :
		lister_les_consultants_disponibles(send_response);
        break;
		
	// l'utilisateur veut connnaitre les chiffres de la prod
	case "i_prod" :
        //response = i_prod_treatment(req);
        break;
    
	default:
        r = "Vous pouvez répéter la question ?";
		send_response(r);
}
 
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
		console.log("result :" + result.toString());
		res.send(result);

	});	
		
	
	
	
	
		
	}
	
	catch (err) {	
	console.log("error: can not proces request");
	res.send("error: can not proces request");
	}
	
});

// pour tester le code
app.get("/test", function(req, res) {
	
	lister_les_consultants_disponibles(
		function (response){
			res.send(response);
		}
	);
});

// pour tester le code
app.get("/test2", function(req, res) {
	
	console.log(" ");
	console.log("  -- starting parser -- ");
		
	var csv = require('csv-array');
	csv.parseCSV("data.csv", function(data){
	
		//////////////////	
		//parsing raw data
		/////////////////

		var query = require('array-query');	
		var result;
		
		//////////////////
		//sorting data : by defaut, descending sort on currenth month
		//////////////////
		console.log("  -- sorting data -- ");
		result = query().sort("m").desc().on(data);
		
		//////////////////
		//filtering data : by defaut, excluding all people not available on current month
		//////////////////
		console.log("  -- filtering data -- ");
		result = query("m").gt(0).on(result);
		
		//////////////////
		//preparing data : short textual representation of data 
		//////////////////
		console.log("  -- preparing restitution -- ");		
		
		var result_as_string = [];
		result.forEach(function(item){
			
			result_as_string.push(item.nom + ", " + item.titre + ", " + item.m);
			console.log(item.nom + ", " + item.titre + ", " + item.m);
			
		});
		
		
		/////////////////	
		//sending data 
		/////////////////
		console.log("  -- sending data -- ");
		res.send(result_as_string);
		
	});	
	
	
});


app.get("/test3", function(req, res) {
	
	console.log(" ");
	console.log("  -- starting parser -- ");
		
	var csv = require('csv-array');
	csv.parseCSV("data.csv", function(data){
	
		//////////////////	
		//parsing raw data
		/////////////////

		var query = require('array-query');	
		var result;
		
		//////////////////
		//sorting data : by defaut, descending sort on currenth month
		//////////////////
		console.log("  -- sorting data -- ");
		result = query().sort("m").desc().on(data);
		
		//////////////////
		//filtering data : by defaut, excluding all people not available on current month
		//////////////////
		console.log("  -- filtering data -- ");
		result = query("m").gt(0).on(result);
		
		//////////////////
		//preparing data : short textual representation of data 
		//////////////////
		console.log("  -- preparing restitution -- ");		
		
		var result_as_string ;
		result.forEach(function(item){
			
			console.log(item.nom + ", " + item.titre + ", " + item.m);
			result_as_string = result_as_string + item.nom + ", " + item.titre + ", " + item.m + "\n" ;
			
		});
		
		
		/////////////////	
		//sending data 
		/////////////////
		console.log("  -- sending data -- ");
		res.send(result_as_string);
			
	});
	
	
	
});

// pour tester le code
app.get("/test4", function(req, res) {
	
	function send_results(results)
	{
		console.log("  -- two -- ");
		res.send(results);
		console.log("  -- three -- ");
	}
	
	console.log("  -- one -- ");
	lister_les_consultants_disponibles(send_results);
	console.log("  -- four -- ");
	
});


function i_prod_treatment(req) {
    
	// on teste si une date a été valorisée
	
	if (req.body.result.parameters['date-period'] == "")
	{
		
		var d = new Date();
		//warning n00b january = 0 !!!
		return d.getMonth() + 1;
	}
	else 
	{
		var s = req.body.result.parameters['date-period']
		return s.substring(5,7);
	}

}
  
function i_dispo_treatment(req) {
    
	// pour l'instant on recupère seulement les grades
	// on ne teste ni la période, ni la prénom
		
	var grade = req.body.result.parameters['grade']
	
	if (grade == "")
	{
		// on liste tous les consultants dispos le mois courant
		return lister_les_consultants_disponibles();
		
	}
	else
	{
		// on liste tous les consultants dispos le mois courant pour le grade demandé
		return lister_les_consultants_disponibles();
	}

}

function lister_les_consultants_disponibles(callback) {
	
	console.log(" ");
	console.log("  -- starting parser -- ");
		
	var csv = require('csv-array');
	csv.parseCSV("data.csv", function(data){
	
		//////////////////	
		//parsing raw data
		/////////////////

		var query = require('array-query');	
		var result;
		
		//////////////////
		//sorting data : by defaut, descending sort on currenth month
		//////////////////
		console.log("  -- sorting data -- ");
		result = query().sort("m").desc().on(data);
		
		//////////////////
		//filtering data : by defaut, excluding all people not available on current month
		//////////////////
		console.log("  -- filtering data -- ");
		result = query("m").gt(0).on(result);
		
		//////////////////
		//preparing data : short textual representation of data 
		//////////////////
		console.log("  -- preparing restitution -- ");		
		
		var result_as_string ;
		result_as_string = "";
		result.forEach(function(item){
			
			console.log(item.nom + ", " + item.titre + ", " + item.m);
			result_as_string = result_as_string + item.nom + ", " + item.titre + ", " + item.m + "\n" ;
			
		});
		
		
		/////////////////	
		//sending data 
		/////////////////
		console.log("  -- executing callback-- ");
		callback(result_as_string);
	});
	
}
