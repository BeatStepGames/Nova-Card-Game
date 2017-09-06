//Handles all server comunications
//serverURL has to be the plain server domain, no protocolo at the beggining
function Server(serverURL){
	this.webSocket = new WebSocket("ws://"+serverURL);
	this.messageCallbacks = [];
	
	this.webSocket.onmessage = function(event){
		console.log("Game Server says: " + event.data);
		for(var i=0; i<server.messageCallbacks.length; i++){
			server.messageCallbacks[i](event.data);
		}
	}
	
	this.webSocket.onopen = function(event){
		console.log("Connected to server");
	}
	
	this.webSocket.onclose = function(){
		
	}
	
	this.webSocket.onerror = function(event){
		
	}
	
	this.sendMessage = function(message){
		if(this.webSocket.readyState == 1){
			console.log("Sending message to WS: "+message);
			this.webSocket.send(message);
			return 1;
		}
		return 0;
	}
	
	this.register = function(callback){
		this.messageCallbacks.push(callback);
	}
	
	
	this.requestCards = function(){
		this.sendMessage("request_cards deck=1");
	}
	
}

var server;

function onLoadHome(){
	loadingURLs();
	server = new Server(document.location.host);
	debugGlobalChat();
	window.server = server;
}





