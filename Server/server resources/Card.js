//card
var card_elements = { //width and height of all elements in card
	card_lenght_x: 160*sizeFactor,
	card_lenght_y: 240*sizeFactor,
	top_space_card: 30*sizeFactor,
	image_space_card: 110*sizeFactor,
	comment_card: 70*sizeFactor,
	atk_def_rank: 30*sizeFactor,
	atk_def_gap: 60*sizeFactor
};

function Card(x,y,name,level,comment,atk,life,imgPath){ //Create and draw the card
	this.x = x;
	this.y = y;
	this.centerX;
	this.centerY;
	this.name = name; //Unique ID! (key)
	this.level = level;
	this.comment = comment;
	this.atk = atk;
	this.life = life;
	this.moving =0; //Ex flag, this one is a better name
	var temp_x;
	var temp_y;
	this._stackID = undefined; //Is needed as an ID inside the stack it belongs (hand, field, graveyard, deck, etc)
	this.img = new Image();
	this.img.loaded = false;
	this.img.onload = function(){
		this.loaded = true;
	}
	this.img.onerror =  function(){ alert('Some images could not be loaded.'); };
	this.img.src = imgPath;
	
	this.draw = function(){
		var width_m;
		var height_m;
		ctx.beginPath();
		
		ctx.textAlign = "center";
		ctx.fillStyle = "black";
		ctx.fillRect(this.x,this.y,card_elements.card_lenght_x,card_elements.card_lenght_y);
		
		ctx.strokeStyle="silver";
		ctx.rect(this.x,this.y,card_elements.card_lenght_x-card_elements.top_space_card, card_elements.top_space_card); //name part
		ctx.font=(12*sizeFactor)+"px Arial";
		ctx.fillStyle = "silver";
		ctx.fillText(this.name,this.x+(card_elements.card_lenght_x-card_elements.top_space_card)/2,this.y+card_elements.top_space_card/2+2); //name text
		
		ctx.font=(18*sizeFactor)+"px Arial";
		width_m = ctx.measureText(100 - this.level).width;
		height_m = ctx.measureText("gggg").width;
		ctx.rect(this.x+card_elements.card_lenght_x-card_elements.top_space_card,this.y,card_elements.top_space_card, card_elements.top_space_card); //level part (top right)
		ctx.fillText(this.level,this.x+card_elements.card_lenght_x-card_elements.top_space_card/2,this.y+(height_m/2)); //level number (top right)
		
		ctx.fillStyle = "black";
		ctx.fillRect(this.x,this.y+card_elements.top_space_card,card_elements.card_lenght_x, card_elements.image_space_card);
		ctx.fillStyle = "black";
		
		if(this.img.loaded){
			ctx.drawImage(this.img,this.x,this.y+card_elements.top_space_card,card_elements.card_lenght_x,card_elements.image_space_card); //image
		}
		
		
		
		ctx.font=(11*sizeFactor)+"px Arial";
		
		ctx.fillStyle = "white";
		ctx.rect(this.x,this.y+card_elements.top_space_card+card_elements.image_space_card,card_elements.card_lenght_x,card_elements.comment_card); //comment part
		splitNewLine(this.comment,this.x,this.y); //text comment
		
		ctx.font=(18*sizeFactor)+"px Arial";
		ctx.fillStyle = "red";
		ctx.rect(this.x,this.y+card_elements.top_space_card+card_elements.image_space_card+card_elements.comment_card,card_elements.card_lenght_x,card_elements.atk_def_rank); //atk def ecc. part
		ctx.fillText(this.atk,this.x+(card_elements.card_lenght_x/2)-card_elements.atk_def_gap,this.y+card_elements.top_space_card+card_elements.image_space_card+card_elements.comment_card+(width_m));
		ctx.fillStyle = "green";
		ctx.fillText(this.life,this.x+(card_elements.card_lenght_x/2)+card_elements.atk_def_gap,this.y+card_elements.top_space_card+card_elements.image_space_card+card_elements.comment_card+(width_m));
		ctx.stroke();
		
		ctx.beginPath();
		ctx.rect(this.x,this.y,card_elements.card_lenght_x, card_elements.card_lenght_y); //image part
		ctx.strokeStyle = "white";
		ctx.stroke();
		
	}
	
	this.handUpdate = function(){ //update card in new position when in hand
		
		this.centerX = this.x + (card_elements.card_lenght_x/2);
		this.centerY = this.y + (card_elements.card_lenght_y/2);
		
		if(mouse.clicked && !grabbed_card && mouse.x>=this.x && mouse.x<=this.x+card_elements.card_lenght_x && mouse.y>=this.y && mouse.y<=this.y+card_elements.card_lenght_y && this.moving == 0){
			
			this.moving = 1;
			temp_x = mouse.x-this.x;
			temp_y = mouse.y-this.y;
			grabbed_card = true; //We grabbed a card, no other cards can be grabbed now
			floatingHandCard = this;
			
		}
		if(this.moving == 1){
			this.x = mouse.x-temp_x;
			this.y = mouse.y-temp_y;
		}
		
		//If mouse is not clicked anymore but card is in moving state, let it go back into the hand, or fixed on the field
		if(mouse.clicked == false && this.moving == 1){
			
			this.moving = 0;
			
			//Check if player is placing a card on the field and place it
			if(field.fieldArea.contains(this.centerX,this.centerY)){
				field.placeCard(this.centerX,this.centerY,this);
			}
			
			grabbed_card = false; //Reset grabbed card, so that we can grab other crads
			floatingHandCard = undefined;
		}
	};
	
	this.fieldUpdate = function(){
		
	}
}
