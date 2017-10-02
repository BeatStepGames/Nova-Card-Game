function Field() {
	
	this.fieldCards = new Array();
	this.collisionMasks = new Array();
	
	this.gap_from_border = 50*sizeFactor;
	this.n_of_pos = 4; //( pos = where you place a card )
	this.lines = 2;
	this.padding = 10*sizeFactor;
	this.pos_width = baseDimensions.card_width+(this.padding*2);
	this.pos_height = baseDimensions.card_height+(this.padding*2);
	
	this.x = canvas.width/2 - (baseDimensions.card_width+(this.padding*2))*(this.n_of_pos/2);
	this.y = 10*sizeFactor;
	
	this.fieldArea = new Rectangle(this.x,this.y,this.pos_width*this.n_of_pos,this.pos_height*this.lines);
	
	for(var j=0;j<=1;j++){
		for(var i=0;i<this.n_of_pos;i++){
			this.collisionMasks[j+""+i] = new Rectangle(this.x + this.pos_width*i,this.y + this.pos_height*j,this.pos_width,this.pos_height);
		}
	}
	
	this.draw = function(ctx){
		
		ctx.beginPath();
		ctx.textAlign = "center";
		ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
		
		for(var j=0;j<=1;j++){
			for(var i=0;i<this.n_of_pos;i++){
				ctx.rect(this.x + this.pos_width*i,this.y + this.pos_height*j,this.pos_width,this.pos_height);
			}
		}
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'white';
		ctx.stroke();
		
		
	};
	
	this.updateFieldCards = function(){
		for(var j=0;j<=1;j++){
			for(var i=0;i<field.n_of_pos;i++){
				if(this.fieldCards[j+""+i] != undefined){
					this.fieldCards[j+""+i].fieldUpdate();
				}
			}
		}
	};
	
	this.drawFieldCards = function(ctx){
		for(var j=0;j<=1;j++){
			for(var i=0;i<field.n_of_pos;i++){
				if(this.fieldCards[j+""+i] != undefined){
					this.fieldCards[j+""+i].draw(ctx);
				}
			}
		}
	};
	
	this.placeCard = function(x,y,card){
		var j=1;
		//for(var j=0;j<=1;j++){
			for(var i=0;i<field.n_of_pos;i++){
				if(field.collisionMasks[j+""+i].contains(x,y) && field.fieldCards[j+""+i] == undefined){
					card.x = this.collisionMasks[j+""+i].x + this.padding;
					card.y = this.collisionMasks[j+""+i].y + this.padding;
					field.fieldCards[j+""+i] = card;
					hand_cards.handStack.remove(card._stackID);
					server.sendMessage("debug card_palced");
					return true;
				}
			}
		//}
		
		return false;
	};
	
	this.onResize = function(sizeFactor){
		this.x = canvas.width/2 - (baseDimensions.card_width+(this.padding*2))*(this.n_of_pos/2);
		this.y = 10;
		
		this.fieldArea.update(this.x,this.y,this.pos_width*this.n_of_pos,this.pos_height*this.lines);
		
		for(var j=0;j<=1;j++){
			for(var i=0;i<this.n_of_pos;i++){
				this.collisionMasks[j+""+i].update(this.x + this.pos_width*i,this.y + this.pos_height*j,this.pos_width,this.pos_height);
			}
		}
		
		for(var j=0;j<=1;j++){
			for(var i=0;i<field.n_of_pos;i++){
				if(field.fieldCards[j+""+i] != undefined){
					this.fieldCards[j+""+i].x = this.collisionMasks[j+""+i].x + this.padding;
					this.fieldCards[j+""+i].y = this.collisionMasks[j+""+i].y + this.padding;
					this.fieldCards[j+""+i].onResize(sizeFactor);
				}
			}
		}
		
	}
	
};