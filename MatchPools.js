var Lobby = require("./Lobby");

class MatchPools {
    constructor(userManager,options={}){
        this.userManager = userManager;
        this.sessionName = options.sessionName || "session";
        this.pools = {
            ranked: [], // Array of Pools
            unranked: [], // Array of Pools
            friendly: [] // Array of Pools
        }
        this.lobbyList = {};
    }

    /**
     * Trys to start a match, or eventually put the player in the waiting list
     * @param {WebSocket} userWS - Player's websocket
     * @param {String} type - Type of match: ranked, unranked, friendly
     * @param {String} enemyUsername - The other player's username
     * @return {String} lobbyID - The unique ID of the lobby
     */
    requestMatch(userWS, type, enemyUsername){
        // Check if the player is alrady playing
        for(let prop in this.lobbyList){
            if(this.lobbyList[prop].isInside(userWS[this.sessionName].username)){
                return "\"already-playing\"";
            }
        }
        // Check if the player is waiting in a pool
        if(this.isInsideAPool(userWS[this.sessionName].username)){
            return "waiting";
        }
        // Load data
        var userData = this.userManager.getUserData(userWS[this.sessionName].username);
        let player = new PoolPlayer(userWS,userWS[this.sessionName].username);

        if(type != "friendly"){
            let rank = userData.rank;
            let rankLevel = parseInt(rank/100);
            let rankVariation = rank/100 - rankLevel;
            let poolIndex = rankLevel;

            // TODO: Add variation to pool selection

            // Create the pool if it doesen't exists
            if(!this.pools[type][poolIndex]){
                this.pools[type][poolIndex] = new Pool(poolIndex*100, poolIndex*100 + 99); // Pool range goes from x00 to x99, with x a natural number
            }
            let pool = this.pools[type][poolIndex];

            let enemy = pool.matchUpPlayer();

            // If no one was waiting in that pool, put this player waiting in the pool
            if(enemy == undefined){
                let inPoolIndex = pool.addPlayer(player);
                // Setting up a timeout to remove the player from the waiting list after 5 minutes if no other players have been found
                player.waitingTimeoutID = setTimeout(function(){

                    let username = player.username;
                    arr = pool.playersList;

                    for(let i=0; i<arr.length; i++){
                        if(arr[i].username == username){
                            this.responseWaitingExpired(player.userWS);
                            arr.splice(i,1);
                            break;
                        }
                    }

                }.bind(this),1000*60*5);

                return "waiting"; // Return that the player is waiting
            }
            // Else, if there was a player waiting and ready to play, set up the match
            else{
                let lobby = new Lobby(player.userWS,enemy.userWS, this.sessionName);
                lobby.state = lobby.STATES.inGame;
                this.lobbyList[lobby.lobbyID] = lobby;
                this.responseWaitingFound(enemy.userWS,lobby.lobbyID);
                return lobby.lobbyID; // Return the lobby the player has been put in
            }

        }
        // If is friendly insted
        else{

        }


    }


    responseWaitingExpired(userWS){
        userWS.res.setReq("waitingmatch");
        userWS.sendRes("waitingmatch expired");
    }

    responseWaitingFound(userWS, lobbyID){
        userWS.res.setReq("waitingmatch");
        userWS.sendRes("waitingmatch found "+lobbyID);
    }

    isInsideAPool(username){
        for(let type in this.pools){
            for(let index = 0; index < this.pools[type].length; index++){
                if(this.pools[type][index]){
                    for(let i=0; i<this.pools[type][index].playersList.length; i++){
                        if(this.pools[type][index].playersList[i].username == username){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }


}

class Pool {
    constructor(from,to){
        this.from = from;
        this.to = to;
        this.playersList = [] // Array of PoolPlayers
    }

    addPlayer(player){
        // We return what push returns, that is the length of the array. -1 so now is the index of the element in the array
        return (this.playersList.push(player)-1);
    }

    matchUpPlayer(){
        let p = this.playersList[0];
        if(p != undefined){
            this.playersList.splice(0,1); // Removing it from the waiting list
            clearTimeout(p.waitingTimeoutID); // Removing the timeout of expiration of waiting
        }
        return p;
    }
}

class PoolPlayer {
    constructor(userWS, username){
        this.userWS = userWS;
        this.username = username;
        this.waitingTimeoutID;
    }
}



module.exports = MatchPools;