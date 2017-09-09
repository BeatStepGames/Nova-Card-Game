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
	try{
		var jsonUsers = fs.readFileSync(path);
		users = JSON.parse(jsonUsers);
		console.log("Users loaded");
	}
	catch(err){
		console.log("No users directory " + err.code);
		console.log(err);
	}
	return users;
}

function saveUsers(users,path){
	var jsonUsers = JSON.stringify(users);
	fs.writeFile(path,jsonUsers,function(err){
		if(err){
			console.log("Error saving users " + err.code);
		}
	});
}



function UserManager(){
	
	this.secureDir = path.join(__dirname,"secure-data");
	
	this.users = loadUsers(path.join(__dirname,"user-data","users.json")) || [];
	
	this.confirmationTokens = [];
	
	this.authUser = function(username,password){
		try{
			var hash = fs.readFileSync(path.join(this.secureDir,username));
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
		
		var res2 = {
				result: 2,
				token: undefined
		};
		
		var res3 = {
				result: 3,
				token: undefined
		};
		
		
		for(var i=0; i<this.users.length; i++){
			//Check if the username is already present
			if(this.users[i].username == username){
				return res2;
			}
			//Check if the email is already present
			else if(this.users[i].email == email){
				return res3;
			}
		}
		
		
		//Signup possible
		var temptoken = genUniqueID(username+"salty"+email);
		this.confirmationTokens[temptoken] = {
			username: username,
			email: email,
			password: bcrypt.hashSync(password)
		};
		this.confirmationTokens[temptoken].timeoutID = setTimeout(function(){
			if(this.confirmationTokens[temptoken]){
				console.log(this.confirmationTokens[temptoken].username + "'s signup confirmation token expired");
				delete this.confirmationTokens[temptoken];
			}
		}.bind(this),(1000*60*30));
		
		var res = {
			result: 1,
			token: temptoken
		}
		return res;
	}
	
	this.confirmUser = function(token){
		if(token != undefined && this.confirmationTokens[token]){
			clearTimeout(this.confirmationTokens[token].timeoutID);
			this.users.push({
				username: this.confirmationTokens[token].username,
				email: this.confirmationTokens[token].email
			});
			fs.writeFile(path.join(this.secureDir,this.confirmationTokens[token].username),
						 this.confirmationTokens[token].password,
						 function(err){
										if(err){
											console.log(err);
										}
						}
			);
			delete this.confirmationTokens[token];
			saveUsers(this.users,path.join(__dirname,"user-data","users.json"));
			return 1;
		}
		return 0;
	}
	
	this.createUser = function(username,email){
		this.username = username || "Unnamed";
		this.email = email || "NoEmail";
	}
		
}


var userManager = new UserManager();

module.exports = userManager;