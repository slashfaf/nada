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
		
		// on récupère le prenom du consultant reçu (en fait le prénom plus le nom)
		let prenom = req.body.result.parameters["prenom"].toLowerCase();
		console.log("prenom :" + prenom);
		
		// on récupère le grade reçu de dialogflow
		let grade = req.body.result.parameters["grade"].toLowerCase(); 
		console.log("grade :" + grade);
		
		// on récupère la période
		let date = req.body.result.parameters["date-period"].toLowerCase(); 
		console.log("date-period :" + date);

		
		lister_les_consultants_disponibles(send_response, prenom, grade, date);
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

// permet de mettre à jour les disponibilités en uploadant un nouveau fichier
app.post("/upload", function (req, res) {
  
  function send_response (response){
	res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
	res.send(JSON.stringify({ "status": response }));
  }
  
	// Writing new file on disk
	const fs = require('fs');
	
	//let content = 'Pingouin rules';
	let content = JSON.stringify(req.body);
	
	console.log(content);

	// write file to disk
	fs.writeFile('pingouin_rules.txt', content, send_response("Fichier uploadé"));
  
});

// permet de visualiser le fichier brut des disponibilites
app.get("/raw", function (req, res) {
  
	function send_response (response){
	res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
	res.send(response);
	}
  
	//reading file on disk and sending it back in HTTP response
	const fs = require('fs');
	
	fs.readFile('pingouin_rules.txt', function (err, data) {
		if (err) throw err;
		send_response(data);
	});

	
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

function lister_les_consultants_disponibles(callback, nom, grade, date) {
	
	console.log(" ");
	console.log("  -- starting parser -- ");
		
	var csv = require('csv-array');
	csv.parseCSV("data.csv", function(data){
	
		//////////////////	
		//parsing raw data
		/////////////////
		var query = require('array-query');	
		var result;
		
				
		if (nom !== "")
		{
			/////////////////
			// if specific consultant has(have) been asked, then only send information for this(these) one(s)
			// even if he is (they are) not available on the required month
			/////////////////		
			result = query("nom").search(nom).on(data);
					
		}
		else
		{
			/////////////////
			// if no specific consultant name has been given, then send information about all consultants
			// who are available on the required month
			// and for the specified grade
			/////////////////				

			if (typeof grade !== 'undefined' && grade !== null) {
			console.log("  -- searching for a specific grade -- ");
			result = query("titre").search(grade).on(data);
			}
			
			//////////////////
			//filtering data : excluding all people not available on the required month
			//////////////////
			console.log("  -- filtering data -- ");
			result = query(date_to_month(date)).gt(0).on(result);
			
		}		
		
		//////////////////
		//sorting data : descending sort on the required month ; if date is empty, then default value is "m"
		//////////////////
		console.log("  -- sorting data -- ");
		result = query().sort(date_to_month(date)).numeric().desc().on(result);
	
			
		//////////////////
		//preparing data : short textual representation of data 
		//////////////////
		console.log("  -- preparing restitution -- ");		
		
		var result_as_string ;
		result_as_string = "";
		
		//////////////////
		//adding formating : bold characters for the month on which we perform sorting
		//////////////////
		m_formating =  "";
		m1_formating = "";
		m2_formating = "";
		switch (date_to_month(date)){
			case "m1" :
			m1_formating = "*";
			break
			
			case "m2" :
			m2_formating = "*";
			
			default :
			m_formating = "*"
		}
		
		result.forEach(function(item){
			
			console.log(item.m + ", " + item.m1 + ", " + item.m2 + ", " + item.nom + ", " + item.titre + ", "  );
			result_as_string =  result_as_string + m_formating + four_digits_string(item.m) + m_formating + "," + m1_formating + four_digits_string(item.m1) + m1_formating + "," + m2_formating + four_digits_string(item.m2) + m2_formating + "," +  item.nom + "," + item.titre +  " \n " ;
			
		});
		
		/////////////////	
		//sending data 
		/////////////////
		console.log("  -- executing callback-- ");
		callback(result_as_string);
	});
	
}

function date_to_month (d) {

/////////////////
// example of date-period sent by dialog flow : 2017-12-01/2017-12-31
/////////////////	
try{

	console.log("d = " + d);
	var required_date = new Date(d.substring(0,10));
	console.log("required_date = " + required_date);
	
	y_req = required_date.getFullYear();
	m_req = required_date.getMonth();

	var date = new Date(), 
	y_now = date.getFullYear(), 
	m_now = date.getMonth();

	diff = (y_req - y_now)*12 + (m_req - m_now); 
	console.log("diff = " + diff);
		
	switch(diff) {
		
		case 0 :
		result = "m";
		break;
			
		case 1 :
		result = "m1";
		break;
		
		case 2 :
		result = "m2";
		break;
		
		default:
		result = "m";
	}

	console.log("result date_to_month = " + result);
	return result;

}
catch(exception)
{
	console.log("erreur in date_to_month, returning m");
	return "m";
}

}

function four_digits_string (s)
{
	switch(s.length)
	{
		case 1 :
		result = "   " + s;
		break;
			
		case 2 :
		result = "  " + s;
		break;
		
		case 3 :
		result = " " + s;
		break;
		
		default:
		result = s;
	}
	
	return result;
}
