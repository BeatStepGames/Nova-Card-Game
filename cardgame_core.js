var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth; //resize canvas!
canvas.height = window.innerHeight;

function splitNewLine(str,x,y){ //comment text of the card, don't touch that
	var array = str.split(' ');
	var line = "";
	var newl=1;
	for(var i=0;i<array.length;i++){
		if(ctx.measureText(line + array[i] + " ").width<card_elements.card_lenght_x){
			line = line + array[i]+ " ";
		}
		else{
			//result = result + line + "\r\n";
			ctx.fillText(line,x+card_elements.card_lenght_x/2,y+card_elements.top_space_card+card_elements.image_space_card+11*newl);
			line = array[i] + " ";
			newl++;
		}
	}
	ctx.fillText(line,x+card_elements.card_lenght_x/2,y+card_elements.top_space_card+card_elements.image_space_card+11*newl);
	return;
}


var ctx = canvas.getContext("2d");
var global_x; //Center of the screen x
var global_y; //Center of the screen y
var all_cards=[]; //array of cards (field card[2x4],cards in hand[from 0 to 7])
var grabbed_card = false; //Tells if we have a card in our hand and cannot take another one

var arrayImg = new Array(); //array of images, need a loading function of all the images in the folder cards (TO-DO)

var floatingHandCard = undefined;




//card
var card_elements = { //width and height of all elements in card
	card_lenght_x: 160,
	card_lenght_y: 240,
	top_space_card: 30,
	image_space_card: 110,
	comment_card: 70,
	atk_def_rank: 30
};

function Card(x,y,name,level,comment,atk,life,img){ //Create and draw the card
	this.x = x;
	this.y = y;
	this.centerX;
	this.centerY;
	this.name = name;
	this.level = level;
	this.comment = comment;
	this.atk = atk;
	this.life = life;
	this.moving =0; //Ex flag, this one is a better name
	var temp_x;
	var temp_y;
	this._stackID = undefined; //Is needed as an ID inside the stack it belongs (hand, field, graveyard, deck, etc)
	
	this.draw = function(){ //Do not touch that ლ(ಠ_ಠლ)
		var width_m;
		var height_m;
		ctx.beginPath();
		ctx.textAlign = "center";
		ctx.fillStyle = 'black';
		ctx.fillRect(this.x,this.y,card_elements.card_lenght_x,card_elements.card_lenght_y);
		
		ctx.strokeStyle='silver';
		ctx.rect(this.x,this.y,card_elements.card_lenght_x-card_elements.top_space_card, card_elements.top_space_card); //name part
		ctx.font="12px Arial";
		ctx.fillStyle = "silver";
		//INCONSISTENCY, NEVER USED WIDTH_M WITH THIS VALUE (used before to center name, now deprecated by the creation of the method splitNewLine() & ctx.textAlign = "center";)
		//width_m = ctx.measureText(this.name).width;
		ctx.fillText(this.name,this.x+(card_elements.card_lenght_x-card_elements.top_space_card)/2,this.y+card_elements.top_space_card/2+2); //name text
		
		ctx.font="18px Arial";
		width_m = ctx.measureText(100 - this.level).width;
		height_m = ctx.measureText("gggg").width;
		ctx.rect(this.x+card_elements.card_lenght_x-card_elements.top_space_card,this.y,card_elements.top_space_card, card_elements.top_space_card); //level part (top right)
		ctx.fillText(this.level,this.x+card_elements.card_lenght_x-card_elements.top_space_card/2,this.y+(height_m/2)); //level number (top right)
		
		
		ctx.drawImage(img,this.x,this.y+card_elements.top_space_card,card_elements.card_lenght_x,card_elements.image_space_card); //image
		ctx.rect(this.x,this.y+card_elements.top_space_card,card_elements.card_lenght_x, card_elements.image_space_card); //image part
		
		ctx.font="11px Arial";
		//var length_text = ctx.measureText(this.comment).width;
		//var str=this.comment.split(' ');
		
		ctx.fillStyle = "white";
		ctx.rect(this.x,this.y+card_elements.top_space_card+card_elements.image_space_card,card_elements.card_lenght_x,card_elements.comment_card); //comment part
		//ctx.fillText(this.comment,this.x,this.y+card_elements.top_space_card+card_elements.image_space_card+10);
		splitNewLine(this.comment,this.x,this.y); //text comment
		
		ctx.font="18px Arial";
		ctx.fillStyle = "red";
		ctx.rect(this.x,this.y+card_elements.top_space_card+card_elements.image_space_card+card_elements.comment_card,card_elements.card_lenght_x,card_elements.atk_def_rank); //atk def ecc. part
		ctx.fillText(this.atk,this.x+(card_elements.card_lenght_x/2)-60,this.y+card_elements.top_space_card+card_elements.image_space_card+card_elements.comment_card+(width_m));
		ctx.fillStyle = "green";
		ctx.fillText(this.life,this.x+(card_elements.card_lenght_x/2)+60,this.y+card_elements.top_space_card+card_elements.image_space_card+card_elements.comment_card+(width_m));
		ctx.stroke();
		
	}
	
	this.update = function(){ //update card in new position
		
		this.centerX = this.x + (card_elements.card_lenght_x/2);
		this.centerY = this.y + (card_elements.card_lenght_y/2);
		
		if(mouse.clicked && !grabbed_card && mouse.x>=this.x && mouse.x<=this.x+card_elements.card_lenght_x && mouse.y>=this.y && mouse.y<=this.y+card_elements.card_lenght_y && this.moving == 0){
			console.log("clicked!");
			this.moving = 1;
			temp_x = mouse.x-this.x;
			temp_y = mouse.y-this.y;
			grabbed_card = true; //We grabbed a card, no other cards can be grabbed now
			floatingHandCard = this;
			
		}
		if(this.moving == 1){
			this.x = mouse.x-temp_x;
			this.y = mouse.y-temp_y;
			lastCard = this;
		}
		
		if(mouse.x>=hand_cards.gap && mouse.x<=this.x+card_elements.card_lenght_x && mouse.y>=this.y){//ADDED
			//check mouse in the card!
			hand_cards.mousein = true;
		} else hand_cards.mousein = false;
		
		//If mouse is not clicked anymore but card is in moving state, fix the card where it is
		if(mouse.clicked == false && this.moving == 1){ 
			this.moving = 0;
			//hand_cards.handStack.push(this,true);
			grabbed_card = false; //Reset grabbed card, so that we can grab other crads
			floatingHandCard = undefined;
		}
		
	}
}

var field = {
	
	fieldCards: new Array(),
	collisionMasks: new Array(),
	
	gap_from_border: 50,
	n_of_pos: 4, //( pos = where you place a card )
	pos_width: card_elements.card_lenght_x+20,
	pos_height: card_elements.card_lenght_y+20,
	
	x: canvas.width/2 - (card_elements.card_lenght_x+20)*2,
	y: 0,
	
	fieldArea: new Rectangle(this.x,this.y,this.pos_width*4,this.pos_height*2),
	
	draw: function(){
		ctx.beginPath();
		ctx.textAlign = "center";
		ctx.fillStyle = 'black';
		ctx.strokeStyle="white";
		
		ctx.beginPath();
		for(var j=0;j<=1;j++){
			for(var i=0;i<field.n_of_pos;i++){
				ctx.rect(field.x + field.pos_width*i,field.y + field.pos_height*j,field.pos_width,field.pos_height);
				this.collisionMasks[j+""+i] = new Rectangle(field.x + field.pos_width*i,field.y + field.pos_height*j,field.pos_width,field.pos_height);
			}
		}
		ctx.fillStyle = 'black';
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'white';
		ctx.stroke();
		
	},
	
	placeCard : function(x,y,card){
		for(var j=0;j<=1;j++){
			for(var i=0;i<field.n_of_pos;i++){
				if(field.collisionMasks[j+""+i].contains(x,y) && field.fieldCards[j+""+i] == undefined){
					field.fieldCards[j+""+i] = card;
					hand_cards.handStack.remove(card._stackID);
					return true;
				}
			}
		}
		
		return false;
	}
	
	
};


var hand_cards = { //position of the cards in hand
	y: canvas.height - card_elements.card_lenght_y,
	gap: 50,
	handStack: new Stack(),
	mousein: false, //ADDED
	
	//This function places the card in the right spot on the screen
	updateHandPosition: function(){
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
				
				var fy = canvas.height - 30; //Final y 
				if( hand_cards.mousein ) fy = canvas.height - card_elements.card_lenght_y - 10;
				var cy = this.handStack.array[i].y; //Current y
				var movDelta = (cy-fy)/10;
				if(Math.abs(movDelta) < 0.005){
					this.handStack.array[i].y = fy;
				}
				else{
					this.handStack.array[i].y = cy - movDelta;
				}
				
			}
			
			else{
				console.log(this.handStack.array[i].name);
			}
		}
	}
};




var imageData;


//Looping function -- Work in here for the game logic
function animate(){
	requestAnimationFrame(animate);
	
	canvas.width = window.innerWidth; //resize canvas!
	canvas.height = window.innerHeight;
	
	
	//ctx.clearRect(0,0,innerWidth,innerHeight); //card!
	
	//Nova card game text
	global_x = canvas.width/2; 
	global_y = canvas.height/2;
	ctx.textAlign = "center";
	ctx.font = "30px Consolas";
	ctx.fillStyle = "silver";
	//ctx.fillStyle = 'white';
	ctx.fillText("Nova Card Game",global_x,global_y);
	
	field.draw();
	
	if(floatingHandCard != undefined && field.fieldArea.contains(floatingHandCard.centerX,floatingHandCard.centerY)){
		if(field.placeCard(floatingHandCard.centerX,floatingHandCard.centerY,floatingHandCard)){
			floatingHandCard = undefined;
		}
	}
	
	//Update position of hand cards
	hand_cards.updateHandPosition();
	
	//Update hand cards
	for(var i=0; i<hand_cards.handStack.length; i++){
		hand_cards.handStack.array[i].update();
	}
	//Draw hand cards
	for(var i=hand_cards.handStack.length-1; i >= 0; i--){
		if(hand_cards.handStack.array[i].moving == 0){
			hand_cards.handStack.array[i].draw();
		}
	}
	//ctx.fillRect(x_card,0,150,220);
	if(floatingHandCard != undefined){
		floatingHandCard.draw();
	}
	
}





function start(){
	canvas.width = window.innerWidth; //resize canvas!
	canvas.height = window.innerHeight;	
	
	img=new Image();
		
	img.onload=function(){		
		animate();		
	}

	//just 4 cards to try push method

	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Emperor of Fire Destiny",7,"[Taunt][Death: destroy a random card in the field]",99,99,img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Bobby",80,"[???][???: destroy a random card]","X","X",img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol",35,"[???][???: destroy a random card]","X","X",img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol2",35,"[???][???: destroy a random card]","X","X",img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol3",35,"[???][???: destroy a random card]","X","X",img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol4",35,"[???][???: destroy a random card]","X","X",img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol5",35,"[???][???: destroy a random card]","X","X",img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol6",35,"[???][???: destroy a random card]","X","X",img));
	//hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol7",35,"[???][???: destroy a random card]","X","X",img));
	//hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol8",35,"[???][???: destroy a random card]","X","X",img));

	img.src='cards/Emperor of Fire Destiny.png';

}
