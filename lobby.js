var bcrypt = require("bcryptjs");

class Lobby{
    /**
     * Construct and set up the Lobby
     * @param {WebSocket} player1 
     * @param {WebSocket} player2
     */
    constructor(player1,player2, sessionName){
        this.lobbyID = genUniqueID("Lobby");
        this.player1 = player1;
        this.player2 = player2;
        this.sessionName = sessionName || "session";

        this.player1.lobby = this;
        this.player2.lobby = this;

        this.player1.isOnline = this.isOnline.bind(this.player1);
        this.player2.isOnline = this.isOnline.bind(this.player2);

        this.STATES = {
            empty:0,
            waitingP2:1,
            inGame:2,
            closing:3
        };

        this.state = this.STATES.empty;

        this.destroyLobby = this.destroyLobby.bind(this);
        this.isEqual = this.isEqual.bind(this);
    }
    
    isOnline(){
        if(this.readyState == 1) return true;
        return false;
    }
    
    destroyLobby(){
        delete this.player1.lobby;
        delete this.player2.lobby;
    }

    isEqual(lobby){
        if(this.lobbyID == lobby.lobbyID){
            return true;
        }
        return false;
    }

    isInside(username){
        if(player1[this.sessionName].username == username || player2[this.sessionName].username == username){
            return true;
        }
        return false;
    }



}

function genUniqueID(salt){
	//Gets the current time, a random number and (if present) the salt, to create a string
	var toHash = new Date().getTime().toString();
	toHash += Math.floor(Math.random() * 1000);
	toHash += salt || "";
	
	//Hash the previosuly generated string to get a unique ID
	return bcrypt.hashSync(toHash);
}

module.exports = Lobby;
module.exports.generateLobbyID = function(){ genUniqueID("Lobby") };