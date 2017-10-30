match = new Matchmaking();

function Matchmaking() {
	
	this.setMatchmakingSection = function(section){
		let totalContainer = document.getElementById("totalContainer");
		let allContainers = totalContainer.querySelectorAll(".matchmakingContainer");
		allContainers.forEach(function(element) {
			element.style.display = "none";
		}, this);
		
		var container;
		
		switch(section) {
			default: // Default is section 0 (return to matchmaking selection page)
			case 0: 
				container = document.getElementById("matchSelection");
				break;
			case 1:
				container = document.getElementById("friendlySelection");
				break;
			case 2:
				container = document.getElementById("waitingSelection");
				break;
		}
		container.style.display = "block";
	}
	
	this.loadUserList = function(){
		server.register("userlist",this.getPlayerList);
		server.registerOnOpenCallback(server.requestUserList);
	}
	
	this.getPlayerList = function(jsonList,keyword){
		var arr = JSON.parse(jsonList);
		var str = "<tr><th>Name</th><th>Rank</th><th>Play</th></tr>";
		if(keyword == undefined) keyword = "";
		
		for(var i = 0; i<arr.length; i++){
			if(arr[i].username.includes(keyword)) str = str + "<tr>" + "<td>" + arr[i].username + "</td>" + "<td>" + arr[i].rank + "</td>" + "<td>" + "Join" + "</td>" + "\r\n";
		}
		document.getElementById("matchmakingLabelClass").innerHTML = str;
	}
	
}