var WebSocketServer = require('websocket').server;
var http = require('http');
var url = require('url');
var fs = require('fs');
var os = require('os');
var path = require('path');
var mime = require('mime');

var serverFolder = __dirname;
var port = 80;
 
var server = http.createServer(function(request, response) {
	console.log(request.connection.remoteAddress +"("+ request.connection.remoteFamily +")" + " connected");
	var file = "";
	var filePath = "";
	if(request.url == "/"){
		file = "index.html";
	}
	else{
		file = request.url;
		file = file.replace(/%20/g," ");
	}
	filePath = path.join(serverFolder, file);
	
	console.log(request.connection.remoteAddress +"("+ request.connection.remoteFamily +")" + "---> (" + request.method + ") request: " + file);
	console.log(" ");
	console.log(request.headers);
	console.log(" ");
	
	fs.lstat(filePath,function(err, stats){
		
		
		if(err != null && err.code == "ENOENT"){
				console.log(request.connection.remoteAddress +"("+ request.connection.remoteFamily +")" + "<--- Error 404: File not found (" + filePath +")");
				response.writeHeader(404,{
					'Content-Type': 'text/html',
					'Server': 'Nova Card Game Server' + os.platform(),
					'length': '25'
					}
				);
				response.write("Error 404: File not found");
				response.end();
				return;
		}
		else if(err != null){
			console.log("Error: " + err);
			return;
		}
		
		if(stats.isDirectory()){
			filePath = path.join(serverFolder, file, "index.html");
			console.log(request.connection.remoteAddress +"("+ request.connection.remoteFamily +")" + "<---> Request was a directory, transformed in: " + filePath)
		}
		
		fs.readFile(filePath, function(err, data){
			
			//If the folder exists but index.html inside it doesn't just return 404
			if(err != null && err.code == "ENOENT"){
				console.log(request.connection.remoteAddress +"("+ request.connection.remoteFamily +")" + "<--- Error 404: File not found (" + filePath +")");
				response.writeHeader(404,{
					'Content-Type': 'text/html',
					'Server': 'Nova Card Game Server' + os.platform(),
					'length': '25'
					}
				);
				response.write("Error 404: File not found");
				response.end();
				return;
			}
			console.log(request.connection.remoteAddress +"("+ request.connection.remoteFamily +")" + "<--- Sending file: " + filePath);
			response.writeHeader(200,{
				'Content-Type': mime.lookup(filePath),
				'Server': 'Nova Card Game Server' + os.platform(),
				'length': data.length.toString()
				}
			);
			response.write(data);
			response.end();
		}
		);
	});
	
});
server.listen(port, function() { console.log("Server started on port " + port); });

//Install websocket with npm
//npm install websocket

var programs = new ServerPrograms();

//WebSocket for comunication
wsServer = new WebSocketServer({
    httpServer: server
});


wsServer.on('request', function(request) {
	console.log("Player (" + request.remoteAddress + ") connected to websocket");
	
    var connection = request.accept(null, request.origin);
 
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Message recieved: ' + message.utf8Data);
			
			var prog = "";
			var params = "";
			if(message.utf8Data.indexOf(" ") != -1){
				prog = message.utf8Data.substr(0,message.utf8Data.indexOf(" "));
				params = message.utf8Data.substr(message.utf8Data.indexOf(" ")+1);
			}
			else {
				prog = message.utf8Data;
			}
			
			if(programs[prog] != undefined){
				programs[prog](connection,params);
			}
			
        }
    });
 
    connection.on('close', function(connection) {
        // Metodo eseguito alla chiusura della connessione
    });
});

function ServerPrograms() {
	//Debug request
	this.debug = function(connection, params){
		connection.sendUTF("DEBUG request recieved from player "+ connection.remoteAddress + " params were: " + params);
	}
	
	//Request of the the deck of the player
	this.request_card = function(connection,params){
		connection.sendUTF("STUB response from server to player "+ connection.remoteAddress);
	}
	
	//Events like attack, draw etc, are handled in here
	this.event = function (connection,params){
		connection.sendUTF("STUB response from server to player "+ connection.remoteAddress);
	}
}
