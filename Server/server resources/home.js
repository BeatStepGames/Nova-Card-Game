//Handles all server comunications
//serverURL has to be the plain server domain, no protocolo at the beggining
function Server(serverURL){
	this.webSocket = new WebSocket("ws://"+serverURL);
	this.messageCallbacks = {};
	
	this.webSocket.onmessage = function(event){
		console.log("Game Server says: " + event.data);
		var filter = event.data.substr(0,event.data.indexOf(" "));
		var message = event.data.substr(event.data.indexOf(" ")+1);

		if(filter == "$notify$"){
			var notif = new FloatingNotification(message);
			notif.show();
		}

		if(this.messageCallbacks[filter]){
			for(var i=0; i<this.messageCallbacks[filter].length; i++){
				this.messageCallbacks[filter][i](message);
			}
		}
	}.bind(this);
	
	this.webSocket.onopen = function(event){
		console.log("Connected to server");
	}.bind(this);
	
	this.webSocket.onclose = function(){
		
	}.bind(this);
	
	this.webSocket.onerror = function(event){
		
	}.bind(this);
	
	this.sendMessage = function(message){
		if(this.webSocket.readyState == 1){
			console.log("Sending message to WS: "+message);
			this.webSocket.send(message);
			return 1;
		}
		return 0;
	}
	
	this.register = function(filter,callback){
		if(this.messageCallbacks[filter] == undefined){
			this.messageCallbacks[filter] = [];
			this.messageCallbacks[filter].push(callback);
		}
	}
	
	this.requestDeck = function(deckIndex,nCards){
		this.sendMessage("requestdeck " + deckIndex + " " + nCards);
	}
	
	this.requestCard = function(name){
		name = name.replace(/\s/g,"%20");
		this.sendMessage("requestcard "+name);
	}
	
}

var server;

function onLoadHome(){	
	server = new Server(document.location.host);
	window.server = server;
	startMatch();
	debugGlobalChat();
}





