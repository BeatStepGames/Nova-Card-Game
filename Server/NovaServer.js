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

//WebSocket for comunication
wsServer = new WebSocketServer({
    httpServer: server
});


wsServer.on('request', function(request) {
	console.log("Player connected to websocket");
	
    var connection = request.accept(null, request.origin);
 
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Message recieved: ' + message.utf8Data);
			connection.sendUTF(message.utf8Data); //echo service
        }
    });
 
    connection.on('close', function(connection) {
        // Metodo eseguito alla chiusura della connessione
    });
});
