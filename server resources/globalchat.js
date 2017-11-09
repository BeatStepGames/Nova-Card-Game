var globalChat;

function startGlobalChat(){
    if(globalChat == undefined){
        globalChat = new GlobalChat();
    }
    
}

class GlobalChat {

	constructor(){
		this.messageList = [];
		this.messageTableBody = document.getElementById("globalChatTableBody");

		// Set up interface to send messages
		this.inputBar = document.getElementById("globalChatInput");
		this.inputBar.addEventListener("keyup",function(e){
			if(e.keyCode == 13){
				let message = this.inputBar.value;
				server.globalChat("send",message);
				this.inputBar.value = "";
			}
		}.bind(this));
		this.inputBtn = document.getElementById("globalChatInputButton");
		this.inputBtn.addEventListener("click",function(e){
			let message = this.inputBar.value;
			server.globalChat("send",message);
			this.inputBar.value = "";
		}.bind(this));

		this.update = this.update.bind(this);
		server.register("globalchat",this.update);
		server.registerOnOpenCallback(function(){
			server.globalChat("update");
		});
	}

	// Method needed to update the interface when new messages arrive
	update(message){
		let params = server.splitParams(message);
		if(params[0] == "update"){
			let messageObjList = JSON.parse(params[1]);
			for(let i=0; i<messageObjList.length; i++){
				this.messageList.push(messageObjList[i]);
				this.addMessage(messageObjList[i]);
			}
		}
		else if(params[0] == "send"){
			let messageObj = JSON.parse(params[1]);
			this.messageList.push(messageObj);
			this.addMessage(messageObj);
		}
	}

	// Adds the elements to the html page to show the new message
	addMessage(messageObject){
		let charPerColor = Math.ceil(messageObject.username.length/3);
		let redLetters = messageObject.username.substr(charPerColor*0,charPerColor).toLowerCase();
		let greenLetters = messageObject.username.substr(charPerColor*1,charPerColor).toLowerCase();
		let blueLetters = messageObject.username.substr(charPerColor*2,charPerColor).toLowerCase();

		// La somma dei valori ascii delle lettere possono andare da 97*charPerColor (la "a") a 122*charPerColor (la "z")
		// quindi il range = 25*charPerColor, colore sarà compreso tra 0 e range.
		// Il range va mappato a 1 byte (0-255) => 25*charPerColor : 255 = colore(red|green|blue) : x
		// il valore rgb del colore sarà (255*colore)/25*charPerColor
		let red = 0;
		for(let i=0; i<redLetters.length; i++){
			red += redLetters.charCodeAt(i) - "a".charCodeAt(0);
		}
		red = Math.round( (255*red)/(25*charPerColor) );

		let green = 0;
		for(let i=0; i<greenLetters.length; i++){
			green += greenLetters.charCodeAt(i) - "a".charCodeAt(0);
		}
		green = Math.round( (255*green)/(25*charPerColor) );

		let blue = 0;
		for(let i=0; i<blueLetters.length; i++){
			blue += blueLetters.charCodeAt(i) - "a".charCodeAt(0);
		}
		blue = Math.round( (255*blue)/(25*charPerColor) );


		this.messageTableBody.innerHTML += 
		`<tr>
			<th style="color: rgb(${red},${green},${blue});">${messageObject.username}</th>
			<td>${messageObject.message}</td>
		</tr>`
	}

}