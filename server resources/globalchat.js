function debugGlobalChat(){
	var canvas = document.getElementById("totalContainer");
	var chatDiv = document.getElementById("chatdiv");
	var chatBtn = document.getElementById("showchat");
	chatBtn.addEventListener("click",function(){
		toggleChat();
	});
	chatBtn.addEventListener("touchstart",function(){
		toggleChat();
	});
	
	var toggleChat = function(){
		if(chatDiv.style.display == "none"){
			chatDiv.style.display = "block";
			canvas.style.display = "none";
		}
		else{
			chatDiv.style.display = "none";
			canvas.style.display = "block";
		}
	}

	var chat = document.getElementById("globalchat");
	var chatInput = document.getElementById("chatinput");

	chatInput.addEventListener("keypress",function(e){
		if(e.keyCode == 13 && chatInput.value.trim() != ""){
			server.sendMessage("globalchat " + chatInput.value.trim().replace(/\s/g,"%20"));
			chatInput.value = "";
		}
	});

	var globalChatUpdate = function(message){
		chat.value += message.replace(/%20/g," ") + "\n";
		/*
		if(message.indexOf("globalchat") != -1){
			chat.value += message.replace(/%20/g," ").substr(message.indexOf(" ")+1) + "\n";
		}
		*/
	};

	window.server.register("globalchat",globalChatUpdate);
	
	
	
	var onlineUsersBtn = document.getElementById("onlineusers");
	onlineUsersBtn.addEventListener("click",function(){
		toggleChat();
		retrieveUsers();
	});
	onlineUsersBtn.addEventListener("touchstart",function(){
		toggleChat();
		retrieveUsers();
	});
	
	var retrieveUsers = function(){
		server.sendMessage("userlist");
	}
	
	var userListUpdate = function(message){
		chat.value = JSON.parse(message.replace(/%20/g," ").substr(message.indexOf(" ")+1)) + "\n";
		/*
		if(message.indexOf("userlist") != -1){
			chat.value = JSON.parse(message.replace(/%20/g," ").substr(message.indexOf(" ")+1)) + "\n";
		}
		*/
	}
	
	window.server.register("userlist",userListUpdate);
	
	
}
