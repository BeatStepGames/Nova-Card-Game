//Handles all server comunications
//serverURL has to be the plain server domain, no protocolo at the beggining
function Server(serverURL){
	this.webSocket = new WebSocket("ws://"+serverURL);
	this.open = false;
	this.messageCallbacks = {};
	this.earlyCallbacks = [];
	let IDManager = {
		nextID: 0,
		getUniqueID: function(){
			this.nextID++;
			return this.nextID;
		}
	}
	var CallbackObject = function(callback){
		this.callback = callback;
		this.active = true;
		this.ID = IDManager.getUniqueID();
	}
	
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
				if(this.messageCallbacks[filter][i].active == true){
					this.messageCallbacks[filter][i].callback(message);
				}
			}
		}
	}.bind(this);
	
	this.webSocket.onopen = function(event){
		console.log("Connected to server");
		this.open = true;
		for(var i=0; i<this.earlyCallbacks.length; i++){
			this.earlyCallbacks[i]();
		}
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
	
	//To register callback called when the comunication with the server is finally established
	this.registerOnOpenCallback = function(callback){
		this.earlyCallbacks.push(callback);
	}

	this.register = function(filter,callback){
		if(this.messageCallbacks[filter] == undefined){
			this.messageCallbacks[filter] = [];
		}
		let cBack = new CallbackObject(callback);
		this.messageCallbacks[filter].push(cBack);
		return cBack.ID;
	}

	this.deleteCallback = function(filter,ID){
		if(this.messageCallbacks[filter] == undefined){
			return 0;
		}
		for(var i=0; i<this.messageCallbacks[filter].length; i++){
			if(this.messageCallbacks[filter][i].ID == ID){
				this.messageCallbacks[filter].splice(i,1);
				return 1;
			}
		}
		return 0;
	}

	this.activateCallback = function(filter,ID){
		if(this.messageCallbacks[filter] == undefined){
			return 0;
		}
		for(var i=0; i<this.messageCallbacks[filter].length; i++){
			if(this.messageCallbacks[filter][i].ID == ID){
				this.messageCallbacks[filter][i].active = true;
				return 1;
			}
		}
		return 0;
	}

	this.deactivateCallback = function(filter,ID){
		if(this.messageCallbacks[filter] == undefined){
			return 0;
		}
		for(var i=0; i<this.messageCallbacks[filter].length; i++){
			if(this.messageCallbacks[filter][i].ID == ID){
				this.messageCallbacks[filter][i].active = false;
				return 1;
			}
		}
		return 0;
	}
	
	this.requestDeck = function(deckIndex = 1,nCards = ""){
		this.sendMessage("requestdeck " + (deckIndex || "1") + " " + (nCards || ""));
	}
	
	this.requestCard = function(name){
		name = name.replace(/\s/g,"%20");
		this.sendMessage("requestcard "+name);
	}

	this.requestDecksAmount = function(){
		this.sendMessage("requestdecksamount");
	}
	
}

var server;
var sizeFactor;

function onLoadHome(){	
	server = new Server(document.location.host);
	window.server = server; //Useless. Just to be sure
	//size factor to keep dimensions consistent
	sizeFactor = window.innerWidth*devicePixelRatio/1536;
	window.sizeFactor = sizeFactor; //Useless. Just to be sure
	startProfilePage();
	//startMatch();
	debugGlobalChat();
}

function onResizeHome(){
	profilePage ? profilePage.drawCards() : undefined;
	onResize();
}




