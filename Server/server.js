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
var port = 80;
var securePort = 443;
var DEBUG = true;

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
	console.log("----------------");
	next();
});

//Resources directory
if(DEBUG == false){
	app.use(minify({cache: __dirname + '/cache'}));
}
app.use(express.static("server resources"));


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
httpServer.listen(port,function(){
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

	wsServer.broadcast("$notify$ " + req[sessionName].username + " Just connected to Nova");
	
	//When the user send a message
	userWS.on('message', function(message) {
		message = message.trim();
		console.log('Message recieved from ( '+ req[sessionName].username + ' / ' + req.connection.remoteAddress + ' ): ' + message);

		var prog = "";
		var params = "";
		if(message.indexOf(" ") != -1){
			var params = message.split(/\s/g);
			prog = params[0];
			params.splice(0,1);
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
			userWS.send("ERROR: Program not implemented");
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
			client.send(data);
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
		userWS.send("DEBUG request recieved from player "+ userWS[sessionName].username + ", params were: " + params);
	}
	
	//The chat visible to every player, params: [0] message sent
	this.globalchat = function(userWS,params){
		wsServer.broadcast("globalchat " + userWS[sessionName].username + ": " + params[0]);
	}

	//A personal chat message, params: [0] user [1] message sent
	this.personalchat = function(userWS,params){
		var secondUser = wsServer.getWebSocketByUsername(params[0]);
		secondUser.send("personalChat "+userWS[sessionName].username + " " + params[1] );
	}

	//A ping message to check that the other player is still receiving data, params: [0] user [1] request or response
	this.pinguser = function(userWS,params){
		var secondUser = wsServer.getWebSocketByUsername(params[0]);
		secondUser.send("pinguser "+userWS[sessionName].username + " " + params[1] );
	}
	
	//Request for the online users list
	this.userlist = function(userWS,params){
		var list = [];
		wsServer.clients.forEach(function each(client) {
			list.push(client[sessionName].username);
		});
		userWS.send("userlist " +JSON.stringify(list).replace(/\s/g,"%20"));
	}
	
	//Request of the the deck of the player, params: [0] card name
	this.requestcard = function(userWS,params){
		params[0] = params[0].replace(/%20/g," ");
		var p = path.join(__dirname, "server resources","cards",params[0]+".json");
		var cardData = "ERROR 404: Not Found";
		try{
			cardData = fs.readFileSync(p);
		}
		catch(err){
			console.log("Requested nonexisting card: " + params[0]);
		}
		userWS.send("requestcard " + cardData);
	}

	//Request for an x ammount of cards from the user's deck, params: [0] deck index starting from 1 [1] n. of cards
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
			deck.splice(params[1],deck.length-params[1]);
		}
		userWS.send("requestdeck " + JSON.stringify(deck));
	}

	this.requestrank = function(userWS,params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		var rank = userData.rank || 0;
		userWS.send("requestrank " + rank);
	}

	this.requestmatchesplayed = function(userWS,params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		var matches = userData.matchsPlayed || 0;
		userWS.send("requestmatchesplayed " + matchs);
	}

	this.requestdecksamount = function(userWS,params){
		var userData = userManager.getUserData(userWS[sessionName].username);
		var ndecks = userData.decks.length || 0;
		userWS.send("requestdecksamount " + ndecks);
	}
	
	//Events like attack, draw etc, are handled in here
	this.event = function (userWS,params){
		userWS.send("STUB response from server to player "+ userWS.remoteAddress);
	}
}






