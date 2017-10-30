var cookie = require("cookie");
var bcrypt = require("bcryptjs");
var fs = require("fs");
var path = require("path");


var sessionList = [];

function genUniqueID(salt){
	//Gets the current time, a random number and (if present) the salt, to create a string
	var toHash = new Date().getTime().toString();
	toHash += Math.floor(Math.random() * 1000);
	toHash += salt || "";
	
	//Hash the previosuly generated string to get a unique ID
	return bcrypt.hashSync(toHash);
}

var sessionFactory = function(options){
	return function(req, res, next){
		req = retrieveSessionFromCookie(req,res,options.cookieName || "");
		next();
	}
}

//Option is the same option object the cookie module require + cookieName & salt (https://www.npmjs.com/package/cookie)
var createSession = function(req,res,options){
	var ID = genUniqueID(options.salt); //Gen the ID for the session
	sessionList[ID] = {id: ID}; //Save the session server side
	//Set the ID client side to retrieve the session on every request
	var cookieValue = cookie.serialize(options.cookieName,ID,options); 
	res.setHeader("set-cookie", cookieValue); 
	//Update the session param inside the request
	req[options.cookieName] = sessionList[ID];
	//Set the expiration timeout for the session (maxAge is in seconds, timeouts are in ms)
	setTimeout(destroySession,options.maxAge*1000,req,undefined,options.cookieName);
	//Saving
	return req;
}

//Destroys the session named = cookieName, delete the cookie from the client and reset req
var destroySession = function(req,res,cookieName){
	//Retrieve the sessionID and delete it from the server sessions
	if(req[cookieName] != undefined){
		var sessionID = req[cookieName].id;
		delete sessionList[sessionID];
	}
	
	//Delete the session cookie from the client
	if(res != undefined){
		var cookieValue = cookie.serialize(cookieName,"Logged Out",{maxAge: 10});
		res.setHeader("set-cookie", cookieValue);
		req[cookieName] = undefined;
	}
	return req;
}


function retrieveSessionFromCookie(req, res, cookieName){
	var cookies = cookie.parse(req.headers.cookie || "");
	if(cookies[cookieName] != undefined){
		var sessionID = cookies[cookieName];
		//If the session with that specific ID exists than put the session inside the req
		if(sessionList[sessionID] != undefined){
			//A param called like the cookie will be created, is an object drom the sessionList
			req[cookieName] = sessionList[sessionID];
		}
		//If the client has sent an id but it's not present on the server token list, destroy the session
		else{
			destroySession(req,res,cookieName);
		}
	}
	return req;
}

function setSessionData(req,cookieName,param,value){
	if(req[cookieName] != undefined){
		var sessionID = req[cookieName].id;
		//If the session with that specific ID exists than put the data inside the session, and the session inside the req
		if(sessionList[sessionID] != undefined){
			//Update the server session data and the pass it to the req object
			sessionList[sessionID][param] = value;
			req[cookieName] = sessionList[sessionID];
		}
	}
	else {
		throw new Error("No session in this request");
	}
	return req;
}

function touchSession(req,res,cookieName){
	var cookieValue = cookie.serialize(cookieName,req[cookieName].id,{maxAge: 10});
	res.setHeader("set-cookie", cookieValue);
}

function saveSessionsToFile(){
	var sessions = JSON.stringify(sessionList);
	fs.writeFileSync(path.join(__dirname,"BeatSessionBackup.pbs"),sessions);
}

function loadSessionsToFile(){
	
}

module.exports = sessionFactory;
module.exports.createSession = createSession;
module.exports.destroySession = destroySession;
module.exports.retrieveSessionFromCookie = retrieveSessionFromCookie;
module.exports.setSessionData = setSessionData;