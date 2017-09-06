var fs = require("fs");
var path = require("path");
var bcrypt = require("bcryptjs");

function genUniqueID(salt){
	//Gets the current time, a random number and (if present) the salt, to create a string
	var toHash = new Date().getTime().toString();
	toHash += Math.floor(Math.random() * 1000);
	toHash += salt || "";
	
	//Hash the previosuly generated string to get a unique ID
	return bcrypt.hashSync(toHash);
}

function loadUsers(path){
	var users = [];
	
}

function UserManager(){
	
	var secureDir = path.join(__dirname,"secure-data");
	
	var users = loadUsers(path.join(__dirname,"user-data"));
	
	var confirmationTokens = [];
	
	this.authUser = function(username,password){
		try{
			var hash = fs.readFileSync(path.join(secureDir,username));
			if(bcrypt.compareSync(password,hash.toString())){
				return true;
			}
			else
				return false;
		}
		catch(err){
			return false;
		}
	}
	
	//Result 1=can signup, need to confirm, 2=username unavailable, 3=email unavailable
	this.signupUser = function(username,password,email){
		
		//Chaeck of the username
		if(users[username] != undefined){
			var res = {
					result: 2,
					token: undefined
			};
			return res;
		}
		//Check if the email
		else{
			
			var err = users.every(function(u){
				if(u.email == email){
					return false;
				}
				return true;
			});
			if(err == false){
				var res = {
						result: 3,
						token: undefined
				};
				return res;
			}
		}
		
		//Signup possible
		var temptoken = genUniqueID("confirmsalty");
		
		
		
		var res = {
			result: 1,
			token: temptoken
		}
		return res;
	}
	
	this.createUser = function(username){
		this.username = username || "Unnamed";
		this.webSocket;
		
		this.available = false;
		
		this.money = 0;
		this.deckID = 0;
		this.enemy = undefined;
	}
	
}


var userManager = new UserManager();

module.exports = userManager;