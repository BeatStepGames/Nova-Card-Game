//Handles all server comunications
//serverURL has to be the plain server domain, no protocolo at the beggining
function Server(serverURL){
	let protocol = (location.protocol.indexOf("https") != -1) ? "wss://" : "ws://";
	this.webSocket = new WebSocket(protocol+serverURL);
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
		this.justOnce = false;
	}

	this.onMessage = function(event){
		var res = JSON.parse(event.data);
		// If the response has a maxage header, save response to cache
		if(res.headers.maxage){
			let reqToCache = {
				program: res.program,
				data = res.data,
				req: res.req,
				headers: req.headers
			}
			delete reqToCache.headers.maxage;
			// We cache a copy of the server response without the maxage header, and we use the JSON rapresentation of the request that triggered this response
			cache.setItem(res.req, reqToCache, res.headers.maxage);
		}

		console.log("Game Server sent: " + event.data);
		var filter = res.program;
		var data = res.data;

		if(filter == "$notify$"){
			var notif = new FloatingNotification(data.message);
			notif.show();
		}

		if(this.messageCallbacks[filter]){
			for(var i=0; i<this.messageCallbacks[filter].length; i++){
				if(this.messageCallbacks[filter][i].active == true){
					// The callbacks can return a boolean to say if they're done and can be deleted
					let destroy = this.messageCallbacks[filter][i].callback(data);
					if(destroy || (this.messageCallbacks[filter][i] && this.messageCallbacks[filter][i].justOnce)){
						this.messageCallbacks[filter].splice(i,1);
					}
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
	
	this.sendMessage = function(program,data,headers){
		// Creating the request object as specified by the protocol
		var req = {
			program: program || "",
			data: data || {},
			headers: headers || {}
		}
		var jsonReq = JSON.stringify(req);
		console.log("Sending message to WS: "+jsonReq);
		// Check if there is a cached server response for this request
		var cachedRes = cache.getItem(jsonReq);
		if(cachedRes){
			// There is, this means the resource is still valid, so force feed this cached server response object to the onMessage method
			// Simulate a websocket event object
			var event = {
				data: JSON.stringify(cachedRes)
			};
			console.log("Request ("+jsonReq+") resolved from cache");
			this.onMessage(event);
			return 1;
		}
		else if(this.webSocket.readyState == 1){
			console.log("Request ("+jsonReq+") sent to server");
			this.webSocket.send(jsonReq);
			return 1;
		}
		return 0;
	}.bind(this);
	
	//To register callback called when the comunication with the server is finally established
	this.registerOnOpenCallback = function(callback){
		if(this.open == false){
			this.earlyCallbacks.push(callback);
		}
		else{
			callback();
		}
	}.bind(this);

	this.register = function(filter,callback,justOnce){
		if(this.messageCallbacks[filter] == undefined){
			this.messageCallbacks[filter] = [];
		}
		let cBack = new CallbackObject(callback);
		cBack.justOnce = justOnce || false;
		this.messageCallbacks[filter].push(cBack);
		return cBack.ID;
	}.bind(this);

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
	}.bind(this);

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
	}.bind(this);

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
	}.bind(this);

	this.splitParams = function(message){
		let inObject = false;
		let inArray = false;
		let inQuote = false;
		for(let i=0; i<message.length; i++){
			if(message[i] == "{" && !inObject && !inArray){
				inObject = true;
			}
			else if(message[i] == "[" && !inArray && !inObject){
				inArray = true;
			}
			else if(message[i] == "}" && inObject){
				inObject = false;
			}
			else if(message[i] == "]" && inArray){
				inArray = false;
			}
			else if(message[i] == "\"" && !inObject && !inArray){
				inQuote = !inQuote;
				message = message.replaceAt(i," ");
			}
			else if( (inQuote || inObject || inArray) && message[i] == " "){
				message = message.replaceAt(i,"§");
			}
		}
		message = message.trim();
		message = message.replace(/\s+/g, " ");
		var params = message.split(/\s/g);
		for (let i = 0; i < params.length; i++) {
			params[i] = params[i].replace(/§/g, " ");
			params[i] = params[i].replace(/\$£/g, "\"");
			params[i] = params[i].replace(/\$£{/g, "{");
			params[i] = params[i].replace(/\$£}/g, "}");
			params[i] = params[i].replace(/\$£\[/g, "[");
			params[i] = params[i].replace(/\$£\]/g, "]");
		}
		return params;
	}

	this.escapeParam = function(str){
		str = str.replace(/"\""/g,"$£");
		str = str.replace(/{/g,"$£{");
		str = str.replace(/}/g,"$£}");
		str = str.replace(/\[/g,"$£[");
		str = str.replace(/\]/g,"$£]");
		return str
	}

	//Type can be request or response
	this.pingUser = function(username,type){
		this.sendMessage("pinguser " + username + " " + type);
	}.bind(this);

	this.requestUserList = function(){
		this.sendMessage("userlist");
	}.bind(this);

	/**
	 * Function to send a global message or to get the last sent
	 * @param {string} type - either "send" to send a message or "update" to get the last sent by everyone
	 * @param {string} message - the message to send globally 
	 */
	this.globalChat = function(type,message){
		if(!message) message = "";
		message = this.escapeParam(message);
		this.sendMessage("globalchat "+type+" \""+message+"\"");
	}.bind(this);
	
	this.requestDeck = function(deckIndex, nCards){
		this.sendMessage("requestdeck " + (deckIndex || "1") + " " + (nCards || ""));
	}.bind(this);
	
	this.requestCard = function(name){
		this.sendMessage("requestcard \""+name+"\"");
	}.bind(this);

	this.requestDecksAmount = function(){
		this.sendMessage("requestdecksamount");
	}.bind(this);

	this.requestCardsOwned = function(){
		this.sendMessage("requestcardsowned");
	}.bind(this);

	// Adds a card to the desired deck, or, if deckIndex == "new", creates new deck and adds card to it
	this.addCardToDeck = function(cardName, deckIndex){
		this.sendMessage("addcardtodeck \"" + cardName + "\" " + deckIndex);
	}.bind(this);

	// Removes a card from the specified deck
	this.removeCardFromDeck = function(cardName, deckIndex){
		this.sendMessage("removecardfromdeck \"" + cardName + "\" " + deckIndex);
	}.bind(this);

	// Completelly delete a deck, prompt a message to be sure of the action
	this.deleteDeck = function(deckIndex){
		let sure = confirm("Are you sure you want to delete deck n. " + deckIndex + "?");
		if(sure){
			this.sendMessage("deletedeck " + deckIndex);
			return true;
		}
		else{
			return false;
		}
	}.bind(this);

	this.requestPlayerInfo = function(){
		this.sendMessage("requestplayerinfo");
	}.bind(this);
	
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
		var jsonObj = JSON.stringify(this.obj);
		localStorage.setItem(this.name,jsonObj);
	}

	retrieveFromMemory(){
		var jsonObj = localStorage.getItem(this.name);
		// If it already exists in the localStorage, parse it and set it as obj
		if(jsonObj){
			this.obj = JSON.parse(jsonObj);
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
	// Set up the ping responding function
	server.register("pinguser",function(message){
		let params = server.splitParams(message);
		// If it's a ping request send a response
		// If is a response, some script in this client has sent a request, so it's going to handle the response that it was waiting
		if(params[1]=="request"){
			server.pingUser(params[0],"response");
		}
		return false; //To keep this callback alive
	});

	//size factor to keep dimensions consistent
	sizeFactor = window.innerWidth*devicePixelRatio/1536;
	window.sizeFactor = sizeFactor; //Useless. Just to be sure
	
	startGlobalChat();
	setPageSection(1);
}

function onResizeHome(){
	profilePage.onResize();
	onResize();
}




// Navbar managing code

var pageSection = 0;

function setPageSection(section){
	if(pageSection == section)
		return;
	let totalContainer = document.getElementById("totalContainer");
	let allContainers = totalContainer.querySelectorAll(".container");
	allContainers.forEach(function(element) {
		element.style.display = "none";
	}, this);

	let navbar = document.getElementById("navbar");
	let allNavbarItems = totalContainer.querySelectorAll(".active");
	allNavbarItems.forEach(function(element) {
		element.classList.remove("active");
	}, this);

	var container;
	var navbarItem;

	switch(section) {
		default: // Default is section 1
		case 1: 
			container = document.getElementById("profilePageContainer");
			navbarItem = document.getElementById("profilePageLink");
			startProfilePage(); 
			break;
		case 2:
			container = document.getElementById("gameCanvasContainer");
			navbarItem = document.getElementById("goToMatch");
			break;
		case 3:
			container = document.getElementById("matchmakingPageContainer");
			navbarItem = document.getElementById("matchmakingLink");
			match.setMatchmakingSection(0);
			break;
		case 4:
			container = document.getElementById("globalChatContainer");
			navbarItem = document.getElementById("globalChatLink");
			break;

	}
	container.style.display = "block";
	navbarItem.classList.add("active");
	pageSection = section;
}

function getPageSection(){
	return pageSection;
}


