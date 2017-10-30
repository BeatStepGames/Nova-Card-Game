//card
class Card extends GameObject{

	constructor(x,y,height,name,level,comment,atk,life,imgPath,sizeFactor){
		super(x,y,(height*(2/3)),height);
		
		/*
		this.attribute_dimension = height*(1/8);
		this.image_space_card = height*(11/24);
		this.comment_card = height*(7/24);
		this.atk_def_rank = height*(1/8);
		this.atk_def_gap = height*(1/4);
		this.nameFontSize = height*(1/20);
		this.numberFontSize = height*(3/40);
		this.commentFontSize = height*(11/240);
		*/
		this.onResize(sizeFactor || 1);
		this.centerX;
		this.centerY;
		this.name = name; //Unique ID! (key)
		this.level = level;
		this.comment = comment;
		this.atk = atk;
		this.life = life;
		this.moving =0; //Ex flag, this one is a better name
		this.temp_x;
		this.temp_y;
		this._stackID = undefined; //Is needed as an ID inside the stack it belongs (hand, field, graveyard, deck, etc)
		this.img = new Image();
		this.img.loaded = false;
		this.img.onload = function(){
			this.loaded = true;
		}
		this.img.onerror =  function(){ console.log(this.name + ' image could not be loaded.'); }.bind(this);
		this.img.src = imgPath;
		this.imageData = undefined;

	}

	onResize(sizeFactor){
		super.onResize(sizeFactor);
		this.attribute_dimension = this.height*(1/6); //dimension of attributes
		this.nameheight_space = this.height*(1/8);
		this.image_space_card = this.height*(11/24);
		this.comment_card = this.height*(10/24);
		//this.atk_def_rank = this.height*(1/8); //not used anymore
		//this.atk_def_gap = this.height*(1/4);
		this.nameFontSize = this.height*(1/18);
		this.numberFontSize = this.height*(3/40);
		this.commentFontSize = this.height*(12/240);
		this.imageData = undefined;
	}
	
	splitNewLine(str,x,y,lenght_x,lenght_y,maxRows,ctx,is_centered){ //comment text of the card, don't touch that; is_centered is a boolean
		var array = str.split(' ');
		var line = [];
		var line_counter=0;
		var relative_y=0;
		line[line_counter] = "";
		ctx.font=(lenght_y/8)+"px Arial";
		
		for(var i=0;i<array.length;i++){
			
			if(ctx.measureText(line[line_counter] + array[i] + " ").width<lenght_x){
				line[line_counter] = line[line_counter] + array[i]+ " ";
			}
			else{
				line_counter++;
				line[line_counter] = array[i] + " ";
				
			}
			if(array[i].indexOf("[") != -1 && array[i].indexOf("]") != -1) {
				line_counter++;
				line[line_counter] = "";
			}
		}
		
		//relative_y=lenght_y/7;
		relative_y=((lenght_y)/(maxRows*2))*((maxRows+3/5)-line_counter); // 3/5 is a standard value, just to detach from the y border
		
		line_counter=1; //reinitialize line_counter
		for(var i=0;i<line.length;i++){
			if(!is_centered) lenght_x = ctx.measureText(line[i]).width;
			ctx.fillText(line[i],x + lenght_x/2,y+relative_y+i*(lenght_y/(maxRows)));
			//line_counter++;
		}
		return;
	}

	draw(ctx){
		super.draw(ctx);

    if(this.imageData == undefined){
		
		//BACKGROUND CARD PART
		ctx.beginPath();
		//pattern image draw
		ctx.rect(this.x,this.y,this.width, this.nameheight_space);
		ctx.rect(this.x,this.y+this.nameheight_space+this.image_space_card,this.width, this.comment_card);
		ctx.fillStyle = ctx.createPattern(loadedimages[3], "repeat");
		ctx.fill();
		ctx.stroke();
		
		//SQUARES&IMGCARD PART
		ctx.beginPath();
		ctx.textAlign = "center";
		//ctx.fillStyle = "black";
		ctx.fillStyle = "rgba(255, 255, 255, 0)";
		//ctx.fillRect(this.x,this.y,this.width,this.height);
		
		ctx.strokeStyle="silver";
		ctx.rect(this.x,this.y,this.width, this.nameheight_space); //name part
		ctx.font=this.nameFontSize+"px Arial";
		ctx.fillStyle = "silver";
		ctx.fillText(this.name,this.x+(this.width)/2,this.y+this.nameheight_space/2+this.nameheight_space/6); //name text
		
		//ctx.font=(this.numberFontSize)+"px Arial";
		
		//ctx.rect(this.x+this.width-this.attribute_dimension,this.y,this.attribute_dimension, this.attribute_dimension); //level part
		//ctx.fillText(this.level,this.x+this.width-this.attribute_dimension/2,this.y+this.attribute_dimension/2+this.attribute_dimension/6); //level number
		
		//ctx.fillStyle = "black";
		ctx.fillStyle = "rgba(255, 255, 255, 0)";
		//ctx.fillRect(this.x,this.y+this.attribute_dimension,this.width, this.image_space_card);
		ctx.fillStyle = "black";
		
		if(this.img.loaded){
			ctx.fillStyle = "black";
			ctx.fillRect(this.x,this.y+this.nameheight_space,this.width, this.image_space_card);
			ctx.drawImage(this.img,this.x,this.y+this.nameheight_space,this.width,this.image_space_card); //image
		}

		//ctx.font=(this.commentFontSize)+"px Arial";
		
		ctx.fillStyle = "white";
		ctx.rect(this.x,this.y+this.nameheight_space+this.image_space_card,this.width,this.comment_card); //comment part
		this.splitNewLine(this.comment,this.x,this.y+this.nameheight_space+this.image_space_card+this.attribute_dimension/2,this.width,this.comment_card-this.attribute_dimension/2,6,ctx,true); //text comment
		
		//ctx.font=(this.numberFontSize)+"px Arial";
		//ctx.fillStyle = "red";
		//ctx.rect(this.x,this.y+this.attribute_dimension+this.image_space_card+this.comment_card,this.width,this.atk_def_rank); //atk def ecc. part
		//ctx.fillText(this.atk,this.x+(this.width/2)-this.atk_def_gap,this.y+this.attribute_dimension+this.image_space_card+this.comment_card+this.atk_def_rank/2+this.atk_def_rank/6);
		//ctx.fillStyle = "green";
		//ctx.fillText(this.life,this.x+(this.width/2)+this.atk_def_gap,this.y+this.attribute_dimension+this.image_space_card+this.comment_card+this.atk_def_rank/2+this.atk_def_rank/6);
		ctx.stroke();
		
		
		//EXT SQUARE PART&ATTRIBUTES
		ctx.beginPath(); 
		ctx.rect(this.x,this.y,this.width, this.height);
		ctx.strokeStyle = "white";
		
		//attributes part! (NOTE: LOADEDIMAGES IS A DEBUG.JS GLOBAL ARRAY!)
		ctx.drawImage(loadedimages[0],this.x,this.y+this.nameheight_space+this.image_space_card-this.attribute_dimension,this.attribute_dimension,this.attribute_dimension); //attack
		ctx.drawImage(loadedimages[1],this.x+this.width-this.attribute_dimension,this.y+this.nameheight_space+this.image_space_card-this.attribute_dimension,this.attribute_dimension,this.attribute_dimension); //life
		ctx.drawImage(loadedimages[2],this.x+(this.width-this.attribute_dimension)/2,this.y+this.nameheight_space+this.image_space_card-this.attribute_dimension+(this.attribute_dimension)/2,this.attribute_dimension,this.attribute_dimension); //mana
		//end attributes part
		
		ctx.stroke();
		//end square part
		
		//NUMBERS PART (+this.attribute_dimension/24 is just to center the y text)
		ctx.beginPath(); 
		ctx.font=(this.numberFontSize)+"px Arial";
		ctx.fillStyle = "red";
		ctx.fillText(this.atk,this.x+this.attribute_dimension/2,this.y+this.nameheight_space+this.image_space_card-this.attribute_dimension*(2/5)+this.attribute_dimension/24);
		ctx.fillStyle = "lightblue";
		ctx.fillText(this.level,this.x+this.width/2,this.y+this.nameheight_space+this.image_space_card+this.attribute_dimension*(1/10)+this.attribute_dimension/24);
		ctx.fillStyle = "green";
		ctx.fillText(this.life,this.x+this.width-this.attribute_dimension/2,this.y+this.nameheight_space+this.image_space_card-this.attribute_dimension*(2/5)+this.attribute_dimension/24);
		ctx.stroke();
		
			if(	this.x > 0 && (this.x+this.width) < ctx.canvas.width &&
				this.y > 0 && (this.y + this.height) < ctx.canvas.height
			){
				this.imageData = ctx.getImageData(this.x,this.y,this.width+2,this.height+2);
			}
			
		}
		else{
			ctx.putImageData(this.imageData,this.x,this.y);
		}
  }

	//update card in new position when in hand
	handUpdate(){
		this.centerX = this.x + (this.width/2);
		this.centerY = this.y + (this.height/2);
		
		if(mouse.clicked && !grabbed_card && mouse.x>=this.x && mouse.x<=this.x+this.width && mouse.y>=this.y && mouse.y<=this.y+this.height && this.moving == 0){
			
			this.moving = 1;
			this.temp_x = mouse.x-this.x;
			this.temp_y = mouse.y-this.y;
			grabbed_card = true; //We grabbed a card, no other cards can be grabbed now
			floatingHandCard = this;
			
			
		}
		if(this.moving == 1){
			this.x = mouse.x-this.temp_x;
			this.y = mouse.y-this.temp_y;
			
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

	}

	fieldUpdate(){}

}
