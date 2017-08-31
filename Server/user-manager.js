function UserManager(){
	
	this.authUser = function(username,password){
		if( (username == "Admin" && password == "password") || (username == "Pas" && password == "Pas") || (username == "Marco" && password == "Marco") || (username == "Lorenzo" && password == "Lorenzo") ){
			return true;
		}
		return false;
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