var http = require("http");
var express = require("express");
var webSocket = require("ws");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("client-sessions");

var httpServer;
var app = express();

//Server vars
var port = 80;

//Express setup
//-------------
//View engine
app.set("view engine","pug");
app.set("views","./views");
//Data parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//Setting user session -- Tutorial: https://stormpath.com/blog/everything-you-ever-wanted-to-know-about-node-dot-js-sessions
app.use(session({
	cookieName: 'session',
	secret: '$3cUrT7!_M4tT3r',
	duration: 30 * 60 * 1000,
	activeDuration: 1 * 60 * 1000,
	cookie: {
		httpOnly: false,
		
	}
}));
//Resources directory
app.use(express.static("server resources"));
//Routes handler
var routes = require("./content-routes");


app.use(function(req,res,next){
	console.log(req.method + " request from: " +req.connection.remoteAddress + " request: " +req.originalUrl);
	console.log("Request session");
	console.log(req.session);
	next();
});

app.use("/",routes);


//If express gets to this point, means he haven't found anything to handle the request
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// If our applicatione encounters an error, we'll display the error and stacktrace accordingly.
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.toString());
});

/*
General http server started below
app.listen(port,function(){
	console.log("Server started on port "+port);
});
*/

//Creating the http server handled by express
var httpServer = http.createServer(app);



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

	wsServer.broadcast(req.connection.remoteAddress + " Just connected to Nova");
	
	//When the user send a message
	userWS.on('message', function(message) {
		console.log('Message recieved from ('+ req.connection.remoteAddress + '): ' + message);

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
			console.log(prog + " result " +programs[prog](userWS,params));
		}
		else{
			userWS.send("ERROR: Program not implemented");
		}

    });
	
	//When the user disconnects from this server
	userWS.on('close', function() {
		console.log("Player (" + req.connection.remoteAddress + ") disconnected to websocket");
		
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


//Starting the server
httpServer.listen(port,function(){
	console.log("Server started on port "+port);
});




//Checks if user's session ID is valid
//info can be both am http request or a websocket info object{origin {String} Origin header, req, the client HTTP GET request, secure {Boolean} true if req.connection.authorized or req.connection.encrypted is set.}
function isUserAuth(info){
	/*
	var cookies = {};
	var headers = {};
	if(info.headers != undefined){
		headers = info.headers;
	}
	else if(info.req.headers != undefined){
		headers = info.req.headers;
	}
	//If there are no cookies, no sessionID available
	if(headers.cookie == undefined){
		return false;
	}
	//Parse the cookies to retrieve session info
	headers = headers["cookie"].split(";");
	for(var i=0; i<headers.length; i++){
		headers[i] = headers[i].trim();
		cookies[headers[i].substr(0,headers[i].indexOf("="))] = headers[i].substr(headers[i].indexOf("=")+1);
	}
	
	if(cookies["sessionID"] != undefined){
		console.log("WebSocket connection grarnted to " + cookies["sessionID"]);
		return true;
	}
	*/
	//TODO change this to false once implemented
	return true;
}


//Handles all requests made through websockets
function ServerPrograms() {
	//Debug request
	this.debug = function(userWS, params){
		userWS.send("DEBUG request recieved from player "+ userWS.remoteAddress + ", params were: " + params);
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
	
	//Request of the the deck of the player
	this.request_card = function(userWS,params){
		userWS.send("STUB response from server to player "+ userWS.remoteAddress);
	}
	
	//Events like attack, draw etc, are handled in here
	this.event = function (userWS,params){
		userWS.send("STUB response from server to player "+ userWS.remoteAddress);
	}
}

function Player(){
	
	this.remoteAddress;
	this.username;
	this.playing = false;	
	
}





