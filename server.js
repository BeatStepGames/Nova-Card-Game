var http = require("http");
var https = require("https");
var express = require("express");
var webSocket = require("ws");
var path = require("path");
var fs = require("fs");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var minify = require("express-minify");


var pasHtmlEngine = require("./PasHtmlEngine");
var routes = require("./content-routes");
var session = routes.session;
var sessionName = 'session';
var userManager = routes.userManager;

var httpServer;
var app = express();

//Server vars
var port = Process.env.PORT || 8080;
var securePort = 443;
var DEBUG = true;

// House keeping functions
Array.prototype.indexOfAll = function(val){
	let indexes = [];
	let i = -1;
    while ((i = this.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

//Express setup
//-------------

//View engine
app.engine("html",pasHtmlEngine);
app.set("view engine","html");
app.set("views","./views");


//Data parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());

//Request logger
app.use(function(req,res,next){
	console.log("");
	console.log(req.method + " request from: " +req.connection.remoteAddress + " request: " +req.originalUrl);
	// console.log(req.headers);
	res.setHeader("X-Powered-By","Nova Card Game");
	console.log("----------------");
	next();
});

//Resources directory
if(DEBUG == false){
	app.use(minify({cache: __dirname + '/cache'}));
}
var staticOptions = {
	maxage: "1d",
	maxAge: "1d",
	etag: true,
	lastModified: true,
	cacheControl: true,
	fallthrough: true,
	setHeaders: function(res, path){
		res.setHeader("X-Powered-By","Nova Card Game");
	}
};
app.use("/card_images",express.static("server resources/card_images/",staticOptions));
app.use("/card_attributes",express.static("server resources/card_attributes/",staticOptions));
app.use("/img",express.static("server resources/img/",staticOptions));

app.use(express.static("server resources",{
	maxage: "0",
	maxAge: "0",
	etag: true,
	lastModified: true,
	cacheControl: true,
	fallthrough: true,
	setHeaders: function(res, path){
		res.setHeader("X-Powered-By","Nova Card Game");
	}
}));


//Routes handler
app.use("/",routes);


//If express gets to this point, means it hasn't found anything to handle the request
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// If our applicatione encounters an error, we'll display the error and stacktrace accordingly.
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	if(err.status == 404){
		res.sendFile(path.join(__dirname,"views","error404.html"));
	}
	else{
		res.send(err.toString());
	}
});


//Creating the http server handled by express
var httpServer = http.createServer(app);

//Starting the server
httpServer.listen(port, function(){
	console.log("Server started on port "+port);
});

//Creating https server
var httpsServer = undefined;
/*
var tlsOptions = {
	key: fs.readFileSync(path.join(__dirname,"TLS-data","nova.key")),
	cert: fs.readFileSync(path.join(__dirname,"TLS-data","nova.cert"))
}
httpsServer = https.createServer(tlsOptions,app);
httpsServer.listen(securePort,function(){
	console.log("TLS server started on port "+securePort);
});
*/





//WEBSOCKET SECTION
/**
 * Comunication is made in client requests and server responses
 * Client request = {
 * 		data: string,
 * 		header:{
 * 			name: value
 * 		}
 * }
 * 
 * Server response = {
 * 		data: string,
 * 		req: string(the data of the request that triggered this response, if present)
 * 		header:{
 * 			name: value
 * 		}
 * }
 * 
 */
var programs = new ServerPrograms();
var playerList = [];
var wsServer = new webSocket.Server({
	server: httpsServer || httpServer,
	clientTracking: true,
	verifyClient: isUserAuth
});

//When a user connects to this server
wsServer.on("connection",function(userWS, req){
	//Retrieving the session for this user and saving them inside his websocket
	req = session.retrieveSessionFromCookie(req,undefined,sessionName);
	userWS[sessionName] = req[sessionName];
	//To load from file the data, even if not used
	userManager.getUserData(req[sessionName].username);

	
	console.log(req[sessionName].username + " (" + req.connection.remoteAddress + ") connected to websocket");
	wsServer.broadcast("$notify$ " + req[sessionName].username + " Just connected to Nova");
	
	//When the user send a message
	userWS.on('message', function(jsonReq) {
		let reqWS;
		try{
		reqWS = JSON.parse(jsonReq);
		}
		catch(err){
			console.log(err)
			reqWS = {
				data: ""
			}
		}
		let message = reqWS.data || "";
		userWS.res = new WSResponse(message);
		userWS.res.setHeader("X-Powered-By","Nova Card Game");
		userWS.sendRes = sendRes;

		console.log('Message recieved from ( '+ req[sessionName].username + ' / ' + req.connection.remoteAddress + ' ): ' + message);

		var prog = "";
		var params = "";
		let inQuote = false;
		for(let i=0; i<message.length; i++){
			if(message[i] == "\""){
				inQuote = !inQuote;
				message = message.replaceAt(i," ");
			}
			else if(inQuote && message[i] == " "){
				message = message.replaceAt(i,"§");
			}
		}
		message = message.trim();
		message = message.replace(/\s+/g," ");
		if(message.indexOf(" ") != -1){
			var params = message.split(/\s/g);
			prog = params[0];
			params.splice(0,1);
			for(let i=0; i<params.length; i++){
				params[i] = params[i].replace(/§/g," ");
			}
		}
		else {
			prog = message;
		}

		if(programs[prog] != undefined){
			var result = programs[prog](userWS,params);
			console.log(prog + " executed");
			if(result != undefined){
				console.log(prog + " result " +result);
			}
		}
		else{
			userWS.sendRes("ERROR: Program not implemented");
		}

    });
	
	//When the user disconnects from this server
	userWS.on('close', function() {
		console.log(req[sessionName].username + " (" + req.connection.remoteAddress + ") disconnected from websocket");
		userManager.forceRemoveUserData(req[sessionName].username);
    });
	
});

//Broadcast function
wsServer.broadcast = function(data) {
	wsServer.clients.forEach(function each(client) {
		if (client.readyState === webSocket.OPEN) {
			client.res = new WSResponse();
			client.res.setHeader("Broadcast","true");
			client.res.setHeader("X-Powered-By","Nova Card Game");
			client.sendRes = sendRes;
			client.sendRes(data);
		}
	});
};

//Retrieve user's websocket by username
wsServer.getWebSocketByUsername = function(username){
	var clients = Array.from(wsServer.clients);
	for(var i=0; i<clients.length; i++){
		if (clients[i][sessionName] != undefined && clients[i][sessionName].username == username){
			return clients[i];
		}
	}
};



// Create a websocket response
function WSResponse(req,data,headers){

	this.setData = function(data){
		this.data = data || "";
	}

	this.setHeader = function(header,value){
		if(this.headers == undefined){
			this.headers = {};
		}
		if(header != undefined){
			this.headers[header] = value;
		}
	}

	this.setReq = function(req){
		if(req != undefined){
			if(typeof req == "string"){
				this.req = req ;
			}
			else{
				this.req = req.data;
			}
		}
		else{
			req = "";
		}
	}

	
	this.setReq(req);
	this.setData(data);
	for(let key in headers){
		this.setHeader(key, headers[key]);
	}

}

// Method to send a response to the client websocket
function sendRes(data){
	if(this.res == undefined){
		this.res = new WSResponse();
	}
	this.res.setData(data);
	var jsonRes = JSON.stringify(this.res);
	this.send(jsonRes);
	this.res = null;
}

//Checks if user's session ID is valid
//info can be both an http request or a websocket info object{origin {String} = Origin header, req = the client HTTP GET request, secure {Boolean} = true if req.connection.authorized or req.connection.encrypted is set.}
function isUserAuth(info){
	var sessionData = {};
	var req;
	//Info is an http req
	if(info.method != undefined){
		req = info;
	}
	//Info is the websocket info object
	else if(info.req.method != undefined){
		req = info.req;
	}
	
	req = session.retrieveSessionFromCookie(req,undefined,sessionName);
	sessionData = req[sessionName];
	
	//If there is no session, or logged == false, not logged
	if(sessionData != undefined && sessionData.logged == true){
		return true;
	}
	return false;
}


//Handles all requests made through websockets
function ServerPrograms() {
	//Debug request
	this.debug = function(userWS, params){
		userWS.sendRes("DEBUG request recieved from player "+ userWS[sessionName].username + ", params were: " + params);
	}
	
	//The chat visible to every player, params: [0] message sent
	this.globalchat = function(userWS,params){
		wsServer.broadcast("globalchat " + userWS[sessionName].username + ": " + params[0]);
	}

	//A personal chat message, params: [0] user, [1] message sent
	this.personalchat = function(userWS,params){
		var secondUser = wsServer.getWebSocketByUsername(params[0]);
		secondUser.sendRes("personalChat "+userWS[sessionName].username + " " + params[1] );
	}

	//A ping message to check that the other player is still receiving data, params: [0] user, [1] request or response
	this.pinguser = function(userWS,params){
		var secondUser = wsServer.getWebSocketByUsername(params[0]);
		secondUser.sendRes("pinguser "+userWS[sessionName].username + " " + params[1] );
	}
	
	//Request for the online users list
	this.userlist = function(userWS,params){
		var list = [];
		wsServer.clients.forEach(function each(client) {
			let userData = userManager.getUserData(userWS[sessionName].username);
			let playerObj = {
				username: client[sessionName].username,
				rank: userData.rank || 0,
				matchesPlayer: userData.matchesPlayed || 0,
				matchesWon: userData.matchesWon || 0,
				matchesLost: userData.matchesLost || 0
			}
			list.push(playerObj);
		});
		userWS.sendRes("userlist " +JSON.stringify(list));
	}

	//Request for a specific user data, params: [0] username
	this.thirduserdata = function(userWS, params){
		//Second parameter is false cause we don't need it to create the new user if it doesn't exists
		var userData = userManager.getUserData(userWS[sessionName].username,false) || {};
		let ret = {
			username: userData.username || "Unknown User",
			rank: userData.rank || 0,
			matchesPlayed: userData.matchesPlayed || 0,
			matchesWon: userData.matchesWon || 0,
			matchesLost: userData.matchesLost || 0
		};
		userWS.sendRes("thirduserdata " + JSON.stringify(ret));
	}
	
	//Request of the the deck of the player, params: [0] card name
	this.requestcard = function(userWS,params){
		var p = path.join(__dirname, "server resources","cards",params[0]+".json");
		var cardData = "ERROR 404: Not Found";
		try{
			cardData = fs.readFileSync(p);
			cardData = cardData.toString();
		}
		catch(err){
			console.log("Requested nonexisting card: " + params[0]);
		}
		userWS.res.setHeader("maxage",(60*12).toString());
		userWS.sendRes("requestcard " + cardData);
	}

	//Request for an x ammount of cards from the user's deck, params: [0] deck index starting from 1, [1] n. of cards
	this.requestdeck = function(userWS,params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		var deck = [];
		if(userData.decks[params[0]-1] != undefined){
			deck = userData.decks[params[0]-1];
		}
		else if(userData.decks[0] != undefined){
			deck = userData.decks[0];
		}
		if(params[1]){
			deck = deck.slice(0,params[1]);
		}
		userWS.sendRes("requestdeck " + JSON.stringify(deck));
	}

	// Send the array of cards owned
	this.requestcardsowned = function(userWS, params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		var deck = userData.cardsOwned;
		userWS.sendRes("requestcardsowned " + JSON.stringify(deck));
	}

	this.requestrank = function(userWS,params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		var rank = userData.rank || 0;
		userWS.sendRes("requestrank " + rank);
	}

	this.requestmatchesplayed = function(userWS,params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		var matches = userData.matchesPlayed || 0;
		userWS.sendRes("requestmatchesplayed " + matches);
	}

	this.requestmoney = function(userWS,params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		var money = userData.money || 0;
		userWS.sendRes("requestmoney " + money);
	}

	this.requestplayerinfo = function(userWS, params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		var rank = userData.rank || 0;
		var matches = userData.matchesPlayed || 0;
		var money = userData.money || 0;
		userWS.sendRes("requestplayerinfo " + rank + " " + matches + " " + money);
	}

	this.requestdecksamount = function(userWS,params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		var ndecks = userData.decks.length || 0;
		userWS.sendRes("requestdecksamount " + ndecks);
	}

	// Adds the card to deck if the user has it and if there are still less than 3 in the deck
	// params[0] = which card to add, param[1] = which deck to add to starting from 1, or "new" to create a new deck
	this.addcardtodeck = function(userWS,params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		if(params[1].toLowerCase() == "new"){
			if(userData.cardsOwned.indexOf(params[0]) != -1){
				let deck = userData.decks[userData.decks.length] = [];
				deck.push(params[0]);
				userWS.sendRes("addcardtodeck YES \"" + params[0] + "\" " + userData.decks.length + " \"new\"");
			}
			else{
				userWS.sendRes("addcardtodeck NO \"" + params[0] + "\" " + userData.decks.length + " \"Card not owned\"");
			}
		}
		else if(params[1] <= userData.decks.length && params[1] > 0){
			params[1] -= 1;
			let nCardsOwned = userData.cardsOwned.indexOfAll(params[0]).length;
			let nCardsDeck = userData.decks[params[1]].indexOfAll(params[0]).length;
			if(nCardsDeck < 3 && nCardsOwned > 0 && nCardsOwned > nCardsDeck){
				userData.decks[params[1]].push(params[0]);
				userWS.sendRes("addcardtodeck YES \"" + params[0] + "\" " + (params[1]+1) + " \"noinfo\"");
			}
			else if (nCardsDeck >= 3){
				userWS.sendRes("addcardtodeck NO \"" + params[0] + "\" " + (params[1]+1) + " \"No more than 3 copies of a card per deck\"");
			}
			else if(nCardsOwned <= 0){
				userWS.sendRes("addcardtodeck NO \"" + params[0] + "\" " + (params[1]+1) + " \"Card not owned\"");
			}
			else if(nCardsOwned <= nCardsDeck){
				userWS.sendRes("addcardtodeck NO \"" + params[0] + "\" " + (params[1]+1) + " \"No more copies of this card owned\"");
			}
		}
		else{
			userWS.sendRes("addcardtodeck NO \"" + params[0] + "\" " + params[1] + " \"Deck dosen't exists\"");
		}
	}

	// Removes a card from the spcified deck
	// params[0] = which card to remove, param[1] = which deck to remove from to starting from 1
	this.removecardfromdeck = function(userWS,params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		if(params[1] <= userData.decks.length && params[1] > 0){
			params[1] -= 1;
			let index = userData.decks[params[1]].indexOf(params[0]);
			if(index != -1){
				userData.decks[params[1]].splice(index, 1);
				userWS.sendRes("removecardfromdeck YES \"" + params[0] + "\" " + (params[1]+1));
				return;
			}
		}
		userWS.sendRes("removecardfromdeck NO \"" + params[0] + "\" " + params[1]);
	}

	// Delete the entire deck form the user's decks list. [0] deck index
	this.deletedeck = function(userWS,params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		params[0] -= 1;
		if(userData.decks.length <= 1){
			userWS.sendRes("deletedeck NO last-deck");
		}
		else if(userData.decks[params[0]] != undefined){
			userData.decks.splice(params[0],1);
			userWS.sendRes("deletedeck YES " + (params[0]+1) );
		}
		else{			
			userWS.sendRes("deletedeck NO " + (params[0]+1) );
		}
	}

	//Events like attack, draw etc, are handled in here
	this.event = function (userWS,params){
		userWS.sendRes("STUB response from server to player "+ userWS.remoteAddress);
	}
}






