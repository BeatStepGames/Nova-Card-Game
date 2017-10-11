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

	this.onMessage = function(event){
		var res = JSON.parse(event.data);
		// If the response has a maxage header, save response to cache
		if(res.headers.maxage){
			cache.setItem(res.req, res.data, res.headers.maxage);
		}

		console.log("Game Server says: " + res.data);
		var filter = res.data.substr(0,res.data.indexOf(" "));
		var message = res.data.substr(res.data.indexOf(" ")+1);

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
	
	this.webSocket.onmessage = this.onMessage;
	
	this.webSocket.onopen = function(event){
		console.log("Connected to server");
		this.open = true;
		for(var i=0; i<this.earlyCallbacks.length; i++){
			this.earlyCallbacks[i]();
		}
	}.bind(this);
	
	this.webSocket.onclose = function(){
		this.open = false;
	}.bind(this);
	
	this.webSocket.onerror = function(event){
		this.open = false;
	}.bind(this);
	
	this.sendMessage = function(message){
		// Check if there is a cached resource for this request
		var cacheRes = cache.getItem(message);
		if(cacheRes){
			// There is, meaning the resource is still valid, so create a fake server response obj
			var res = {
				data: cacheRes,
				req: message,
				headers: {}
			}
			// Simulate a websocket event
			var event = {
				data: JSON.stringify(res)
			};
			this.onMessage(event);
			return 1;
		}
		if(this.webSocket.readyState == 1){
			console.log("Sending message to WS: "+message);
			var req = {
				data: message,
				headers: {}
			}
			var jsonReq = JSON.stringify(req);
			this.webSocket.send(jsonReq);
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

class StorageObject{

	constructor(name){
		this.name = name;
		this.obj = {}
	}

	setItem(key,value){
		this.obj[key] = value;
		this.saveToMemory();
	}

	getItem(key){
		this.retrieveFromMemory();
		return this.obj[key];
	}

	removeItem(key){
		if(this.obj[key]){
			delete this.obj[key];
			this.saveToMemory();
		}
	}

	saveToMemory(){
		var jsonCache = JSON.stringify(this.obj);
		localStorage.setItem(this.name,jsonCache);
	}

	retrieveFromMemory(){
		var jsonCache = localStorage.getItem(this.name);
		// If it already exists in the localStorage, parse it and set it as obj
		if(jsonCache){
			this.obj = JSON.parse(jsonCache);
		}
		// Else create this data in the localStorage
		else{
			this.saveToMemory();
		}
	}
}

class Cache extends StorageObject{
	constructor(){
		super("cache");
	}

	// maxage is in seconds
	setItem(key,value,maxage){
		let val = {
			data: value,
			expire: new Date().getTime()/1000 + Number(maxage)
		}
		super.setItem(key,val);
	}

	getItem(key){
		let data = super.getItem(key);
		if(data){
			if(data.expire > new Date().getTime()/1000){
				return data.data;
			}
			else{
				data = undefined;
				super.removeItem(key);
			}
		}
		return data;
	}

}

var cache = new Cache();
var prefs = new StorageObject("preferences");
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




