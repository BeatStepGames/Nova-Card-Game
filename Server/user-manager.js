var fs = require("fs");
var path = require("path");
var bcrypt = require("bcryptjs");

function UserManager(){
	
	var secureDir = path.join(__dirname,"secure-data");
	
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