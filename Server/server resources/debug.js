function debugGlobalChat(){
	var canvas = document.getElementById("canvas");
	var chatDiv = document.getElementById("chatdiv");
	var charBtn = document.getElementById("showchat").addEventListener("click",function(){
		if(chatDiv.style.display == "none"){
			chatDiv.style.display = "block";
			canvas.style.display = "none";
		}
		else{
			chatDiv.style.display = "none";
			canvas.style.display = "block";
		}
	});

	var chat = document.getElementById("globalchat");
	var chatInput = document.getElementById("chatinput");

	chatInput.addEventListener("keypress",function(e){
		if(e.keyCode == 13){
			server.sendMessage("globalchat " + chatInput.value.replace(/\s/g,"%20"));
		}
	});

	var globalChatUpdate = function(message){
		if(message.indexOf("globalchat") != -1){
			chat.value += message.replace(/%20/g," ").substr(message.indexOf(" ")+1) + "\n";
		}
	};

	window.server.register(globalChatUpdate);
}