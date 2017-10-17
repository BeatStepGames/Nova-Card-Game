class Field extends GameObject {
	//x is CENTRAL
	constructor(x, y, cardWidth, cardHeight, rows, columns){
		super(x, y, columns*(cardWidth + (cardWidth*(1/15)*2) ), rows*(cardHeight + (cardWidth*(1/15)*2) ) );
		
		this.fieldCards = new Array();
		this.collisionMasks = new Array();
		
		this.rows = rows;
		this.columns = columns;
		this.paddingRatio = 1/15;
		
		this.originalCardWidth = cardWidth;
		this.originalCardHeight = cardHeight;
		this.cardWidth = cardWidth;
		this.cardHeight = cardHeight;
		//this.padding = cardWidth*this.paddingRatio;
		
		//this.areaFieldX = this.cardWidth+(this.padding*2); //width of an AreaField (where you place the card)
		//this.areaFieldY = this.cardHeight+(this.padding*2); //height of an AreaField
		this.borderX = this.x-(this.width/2); //border x of the field, not the center x
		//this.borderY = this.y-(this.height/2); //border y of the field, not the center y
		this.borderY = this.y;
		
		this.fieldArea = new Rectangle(this.borderX, this.borderY, this.width, this.height);
		
		for(var j=0;j<this.rows;j++){
			for(var i=0;i<this.columns;i++){
				this.collisionMasks[j+""+i] = new Rectangle(this.borderX + this.cardWidth*i,this.borderY + this.cardHeight*j,this.cardWidth,this.cardHeight);
			}
		}
		
	}
	
	draw(ctx){
		ctx.beginPath();
		ctx.textAlign = "center";
		ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
		
		for(var j=0;j<this.rows;j++){
			for(var i=0;i<this.columns;i++){
				ctx.rect(this.borderX + this.cardWidth*i,this.borderY + this.cardHeight*j,this.cardWidth,this.cardHeight);
			}
		}
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'white';
		ctx.stroke();
	}
	
	drawFieldCards(ctx){
		for(var j=0;j<this.rows;j++){
			for(var i=0;i<this.columns;i++){
				if(this.fieldCards[j+""+i] != undefined){
					this.fieldCards[j+""+i].draw(ctx);
				}
			}
		}
	}
	
	updateFieldCards(){
		for(var j=0;j<this.rows;j++){
			for(var i=0;i<this.columns;i++){
				if(this.fieldCards[j+""+i] != undefined){
					this.fieldCards[j+""+i].fieldUpdate();
				}
			}
		}
	}
	
	placeCard(x,y,card){
		var j=1; //ally field (?)
		//for(var j=0;j<=1;j++){
			for(var i=0;i<this.columns;i++){
				if(field.collisionMasks[j+""+i].contains(x,y) && field.fieldCards[j+""+i] == undefined){
					//card.x = this.collisionMasks[j+""+i].x + this.padding;
					//card.y = this.collisionMasks[j+""+i].y + this.padding;
					
					card.setCenterX(this.collisionMasks[j+""+i].x+this.collisionMasks[j+""+i].width/2);
					card.setCenterY(this.collisionMasks[j+""+i].y+this.collisionMasks[j+""+i].height/2);
					
					field.fieldCards[j+""+i] = card;
					
					//field.fieldCards[j+""+i].zoom(field.fieldCards[j+""+i].width*2,field.fieldCards[j+""+i].height*2,100); //DEBUG ANIMATION TEST HERE!!! <----
					
					hand_cards.handStack.remove(card._stackID);
					server.sendMessage("debug card_palced");
					
					return true;
				}
			}
		//}
		
		return false;
	}
	
	onResize(sizeFactor){
		super.onResize(sizeFactor);
		
		this.cardHeight = this.originalCardHeight*sizeFactor;
		this.cardWidth = this.originalCardWidth*sizeFactor;
		//this.padding = this.cardWidth*this.paddingRatio;
		//this.areaFieldX = this.cardWidth;
		//this.areaFieldY = this.cardHeight;
		this.borderX = this.x-(this.width/2);
		//this.borderY = this.y-(this.height/2);
		this.borderY = this.y;
		
		this.fieldArea.update(this.borderX ,this.borderY ,this.cardWidth*this.columns,this.cardHeight*this.rows);
		
		for(var j=0;j<this.rows;j++){
			for(var i=0;i<this.columns;i++){
				this.collisionMasks[j+""+i].update(this.borderX + this.cardWidth*i,this.borderY + this.cardHeight*j,this.cardWidth,this.cardHeight);
			}
		}
		
		for(var j=0;j<this.rows;j++){
			for(var i=0;i<this.columns;i++){
				if(field.fieldCards[j+""+i] != undefined){
					//this.fieldCards[j+""+i].x = this.collisionMasks[j+""+i].x + this.padding;
					//this.fieldCards[j+""+i].y = this.collisionMasks[j+""+i].y + this.padding;
					this.fieldCards[j+""+i].onResize(sizeFactor);
					this.fieldCards[j+""+i].setCenterX(this.collisionMasks[j+""+i].x + this.cardWidth/2);
					this.fieldCards[j+""+i].setCenterY(this.collisionMasks[j+""+i].y + this.cardHeight/2);
					
					
					 
				}
			}
		}
	}
	
}