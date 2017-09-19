var http = require("http");
var https = require("https");
var express = require("express");
var webSocket = require("ws");
var path = require("path");
var fs = require("fs");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var minify = require("express-minify");

var routes = require("./content-routes");
var session = routes.session;
var sessionName = 'session';

var httpServer;
var app = express();

//Server vars
var port = 54800;
var securePort = 443;
var DEBUG = true;

//Express setup
//-------------

//View engine
/*
app.set("view engine","pug");
app.set("views","./views");
*/

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

//Crrating https server
var tlsOptions = {
	key: fs.readFileSync(path.join(__dirname,"TLS-data","nova.key")),
	cert: fs.readFileSync(path.join(__dirname,"TLS-data","nova.cert"))
}
var httpsServer = https.createServer(tlsOptions,app);
httpsServer.listen(securePort,function(){
	console.log("TLS server started on port "+securePort);
});





//WEBSOCKET SECTION

var programs = new ServerPrograms();
var playerList = [];
var wsServer = new webSocket.Server({
	server: httpServer,
	clientTracking: true,
	verifyClient: isUserAuth
});

//When a user connects to this server
wsServer.on("connection",function(userWS, req){
	req = session.retrieveSessionFromCookie(req,undefined,sessionName);
	userWS[sessionName] = req[sessionName];
	wsServer.broadcast(req.session.username + " Just connected to Nova");
	
	//When the user send a message
	userWS.on('message', function(message) {
		console.log('Message recieved from ( '+ req.session.username + ' / ' + req.connection.remoteAddress + ' ): ' + message);

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
		console.log(req.session.username + " (" + req.connection.remoteAddress + ") disconnected from websocket");
		
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

//Retrieve user's websocket by username<
wsServer.getWebSocketByUsername = function(username){
	var clients = wsServer.clients;
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
	
	//If there are is no session, or logged == false, not logged
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
	
	/*
	//As soon as the player load the game page, sends a login request to the server, to let it know he is online
	//Params are username password
	this.login = function(userWS,params){
		if(isUserAuth(params[0],params[1]) ){
			var p = new Player();
			p.remoteAddress = userWS.remoteAddress;
			p.username = params[0];
			playerList.push(p);
			return 1;
		}
		return 0;
	}
	*/
	
	//The chat visible to every player, params: [0] message sent
	this.globalchat = function(userWS,params){
		wsServer.broadcast("globalchat " + userWS[sessionName].username + ": " + params[0]);
	}
	
	//Request for the online users list
	this.userlist = function(userWS,params){
		var list = [];
		wsServer.clients.forEach(function each(client) {
			list.push(client[sessionName].username);
		});
		userWS.send("userlist " +JSON.stringify(list).replace(/\s/g,"%20"));
	}
	
	//Request of the the deck of the player
	this.request_card = function(userWS,params){
		userWS.send("STUB response from server to player "+ userWS.remoteAddress);
	}
	
	//Events like attack, draw etc, are handled in here
	this.event = function (userWS,params){
		userWS.send("STUB response from server to player "+ userWS.remoteAddress);
	}
}






