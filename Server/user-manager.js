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

function loadDataFromJsonFile(path){
	var data;
	try{
		var jsonData = fs.readFileSync(path);
		data = JSON.parse(jsonData);
		console.log("Users loaded");
	}
	catch(err){
		console.log("No users directory " + err.code);
		console.log(err);
	}
	return data;
}

function saveDataToJsonFile(data,path){
	var jsonData = JSON.stringify(data);
	fs.writeFile(path,jsonData,function(err){
		if(err){
			console.log("Error saving users " + err.code);
		}
	});
}



function UserManager(){
	
	this.secureDir = path.join(__dirname,"secure-data");
	this.signupDataPath = path.join(__dirname,"signup-data","users.json");
	this.userDataDir = path.join(__dirname,"user-data");
	
	this.registeredUsers = loadDataFromJsonFile(this.signupDataPath) || [];
	this.usersData = {};
	
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
				token: undefined,
				message: "Username unavailable"
		};
		
		var res3 = {
				result: 3,
				token: undefined,
				message: "Email already used"
		};
		
		
		for(var i=0; i<this.registeredUsers.length; i++){
			//Check if the username is already present
			if(this.registeredUsers[i].username == username){
				return res2;
			}
			//Check if the email is already present
			else if(this.registeredUsers[i].email == email){
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
		}.bind(this),(1000*60*30)); //30 minutes for confirmation
		
		var res = {
			result: 1,
			token: temptoken,
			message: "Signup accepted"
		}
		return res;
	}
	
	this.confirmUser = function(token){
		if(token != undefined && this.confirmationTokens[token]){
			clearTimeout(this.confirmationTokens[token].timeoutID);
			this.registeredUsers.push({
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
			saveDataToJsonFile(this.registeredUsers,this.signupDataPath);
			return 1;
		}
		return 0;
	}
	
	//Return the data of the user if in memory, load it from file and then returns it otherwise
	this.getUserData = function(username){
		if(this.usersData[username] != undefined){
			//Clear the old timeout
			clearTimeout(this.usersData[username].deleteTimeout);
		}
		else{
			//Load the data from file
			this.usersData[username].user = loadDataFromJsonFile(path.join(this.userDataDir,username+".json"));
			//Setting the autosave timeout every hour
			this.usersData[username].autoSaveTimeout = setTimeout(recursiveAutoSave.bind(this),(1000*60*60),username);

		}

		//Set the new timeout to delete the data if not used within 5 hours
		this.usersData[username].deleteTimeout = setTimeout(function(){
			this.forceRemoveUserData(username);
			console.log(username + " data has been removed from memory, because not used for long time");
		}.bind(this),(1000*60*60*5),username);

		//Return this data
		return this.usersData[username].user;
	}

	//Saves data passed for the username passed
	this.saveUserData = function(username,paramName,paramValue,options){
		if(this.usersData[username] == undefined){
			this.getUserData();
		}
		if(this.usersData[username] != undefined){
			if(options && options.delete == true){
				delete this.usersData[username].user[paramName]
			}
			else{
				this.usersData[username].user[paramName] = paramValue;
				if(options.forceSave == true){
					saveDataToJsonFile(this.usersData[username].user,path.join(this.userDataDir,username+".json"));
					clearTimeout(this.usersData[username].autoSaveTimeout);
					this.usersData[username].autoSaveTimeout = setTimeout(recursiveAutoSave.bind(this),(1000*60*60),username);
				}
			}
			return 1;
		}
		return 0;
	}

	//Recursive calling timeout to save data to file
	var recursiveAutoSave = function(username){
		if(this.usersData[username]){
			saveDataToJsonFile(this.usersData[username].user,path.join(this.userDataDir,username+".json"));
			this.usersData[username].autoSaveTimeout = setTimeout(recursiveAutoSave.bind(this),(1000*60*60),username);
		}
	}

	//Used to force removing user data from memory
	this.forceRemoveUserData = function(username){
		if(this.usersData[username]){
			clearTimeout(this.usersData[username].autoSaveTimeout);
			saveDataToJsonFile(this.usersData[username].user,path.join(this.userDataDir,username+".json"));
			clearTimeout(this.usersData[username].deleteTimeout);
			delete this.usersData[username];
		}
		
	}



}


var userManager = new UserManager();

module.exports = userManager;