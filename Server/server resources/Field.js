class Field extends GameObject {
	//x&y are CENTRAL
	constructor(x,y,height,rows,columns,padding){ // padding = distance from border of the fieldcard & the card; height of the card!
		super(x,y,columns*(height*(2/3)+(padding*2)),rows*height+(padding*2));
		
		this.fieldCards = new Array();
		this.collisionMasks = new Array();
		
		this.areaFieldX = height*(2/3)+(padding*2); //width of an AreaField (where you place the card)
		this.areaFieldY = height+(padding*2); //height of an AreaField
		this.borderX = this.x-(columns/2)*this.areaFieldX; //border x of the field, not the center x
		this.borderY = this.y-(rows/2)*this.areaFieldY; //border y of the field, not the center y
		
		this.fieldArea = new Rectangle(this.borderX, this.borderY, this.areaFieldX*this.columns, this.areaFieldY*this.rows);
		
		for(var j=0;j<this.rows;j++){
			for(var i=0;i<this.columns;i++){
				this.collisionMasks[j+""+i] = new Rectangle(this.borderX + this.areaFieldX*i,this.borderY + this.areaFieldY*j,this.areaFieldX,this.areaFieldY);
			}
		}
	}
	
	draw(ctx){
		ctx.beginPath();
		ctx.textAlign = "center";
		ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
		
		for(var j=0;j<this.rows;j++){
			for(var i=0;i<this.columns;i++){
				ctx.rect(this.borderX + this.areaFieldX*i,this.borderY + this.areaFieldY*j,this.areaFieldX,this.areaFieldY);
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
	}
	
	onResize(sizeFactor){
		super.onResize(sizeFactor);
		
		this.borderX = this.x-(this.columns/2)*this.areaFieldX;
		this.borderY = this.y-(this.rows/2)*this.areaFieldY;
		
		this.fieldArea.update(this.borderX ,this.borderY ,this.areaFieldX*this.columns,this.areaFieldY*this.rows);
		
		for(var j=0;j<this.rows;j++){
			for(var i=0;i<this.columns;i++){
				this.collisionMasks[j+""+i].update(this.borderX + this.areaFieldX*i,this.borderY + this.areaFieldY*j,this.areaFieldX,this.areaFieldY);
			}
		}
		
		for(var j=0;j<this.rows;j++){
			for(var i=0;i<this.columns;i++){
				if(field.fieldCards[j+""+i] != undefined){
					this.fieldCards[j+""+i].x = this.collisionMasks[j+""+i].x + this.padding;
					this.fieldCards[j+""+i].y = this.collisionMasks[j+""+i].y + this.padding;
					this.fieldCards[j+""+i].onResize(sizeFactor);
				}
			}
		}
	}
	
}