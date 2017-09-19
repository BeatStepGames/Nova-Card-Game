function HandCards() { //position of the cards in hand
	this.y = canvas.height - card_elements.top_space_card;
	this.gap = 50*sizeFactor;
	this.bottomPadding = 10*sizeFactor;
	this.handStack = new Stack();
	this.mousein = false;
	
	//This function places the card in the right spot on the screen
	this.updateHandPosition = function(){
		
		if(this.mousein == false){
			this.y = canvas.height - card_elements.top_space_card;
		}
		else {
			this.y = canvas.height - card_elements.card_lenght_y - this.bottomPadding;
		}
		
		//check mouse in the hand cards area
		if(mouse.y>=this.y ){ //this.handStack.length > 0 && mouse.x>=this.handStack.array[0].x && mouse.x <= this.handStack.array[this.handStack.array.length-1].x+card_elements.card_lenght_x 
			this.mousein = true;
		} 
		else{
			this.mousein = false;
		}
		
		//Animation of moving cards
		var deltaDistance = (canvas.width-(4*this.gap) )/ this.handStack.length;

		if ( deltaDistance > (card_elements.card_lenght_x+this.gap) ) deltaDistance = card_elements.card_lenght_x+(this.gap/2);
		
		for(var i=0; i<this.handStack.length; i++){
			if(this.handStack.array[i].moving == 0){
				var fx = deltaDistance*i + this.gap; //Final x
				var cx = this.handStack.array[i].x; //Current x
				var movDelta = (cx-fx)/10;
				if(Math.abs(movDelta) < 0.005){
					this.handStack.array[i].x = fx;
				}
				else{
					this.handStack.array[i].x = cx - movDelta;
				}
				
				var fy = this.y;
				var cy = this.handStack.array[i].y; //Current y
				var movDelta = (cy-fy)/10;
				if(Math.abs(movDelta) < 0.005){
					this.handStack.array[i].y = fy;
				}
				else{
					this.handStack.array[i].y = cy - movDelta;
				}
				
			}
		}
	};
	
	this.updateHandCards = function(){
		for(var i=0; i<this.handStack.length; i++){
			this.handStack.array[i].handUpdate();
		}
	};
	
	this.drawHandCards = function(){
		for(var i=this.handStack.length-1; i >= 0; i--){
			if(this.handStack.array[i].moving == 0){
				this.handStack.array[i].draw();
			}
		}
		if(floatingHandCard != undefined){
			floatingHandCard.draw();
		}
	};
	
	this.onResize = function(){
		
	}
	
};


