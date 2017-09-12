var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth; //resize canvas!
canvas.height = window.innerHeight;

var sizeFactor = canvas.width/1536;

// Image loading global variables
var loadcount = 0;
var loadtotal = 0;
var preloaded = false;
var imageURLs = [];
var imgs = [];

function splitNewLine(str,x,y){ //comment text of the card, don't touch that
	var array = str.split(' ');
	var line = "";
	var newl=1;
	var line_counter=0;
	var relative_y=0;
	
	for(var i=0;i<array.length;i++){
		if(ctx.measureText(line + array[i] + " ").width<card_elements.card_lenght_x){
			line = line + array[i]+ " ";
		}
		else{
			line = array[i] + " ";
			line_counter++;
		}
		if(array[i].includes("[") && array[i].includes("]")) {
			line = "";
			line_counter++;
		}
	}
	
	relative_y=2.5-line_counter*0.5;
	line = "";
	
	for(var i=0;i<array.length;i++){
		if(ctx.measureText(line + array[i] + " ").width<card_elements.card_lenght_x){
			line = line + array[i]+ " ";
		}
		else{
			//result = result + line + "\r\n";
			ctx.fillText(line,x+card_elements.card_lenght_x/2,y+card_elements.top_space_card+card_elements.image_space_card+(11*sizeFactor)*newl + (11*sizeFactor)*relative_y);
			line = array[i] + " ";
			newl++;
		}
		if(array[i].includes("[") && array[i].includes("]")) {
			ctx.fillText(line,x+card_elements.card_lenght_x/2,y+card_elements.top_space_card+card_elements.image_space_card+(11*sizeFactor)*newl + (11*sizeFactor)*relative_y);
			line = "";
			newl++;
		}
	}
	ctx.fillText(line,x+card_elements.card_lenght_x/2,y+card_elements.top_space_card+card_elements.image_space_card+(11*sizeFactor)*newl + (11*sizeFactor)*relative_y);
	return;
}


var ctx = canvas.getContext("2d");
var global_x; //Center of the screen x
var global_y; //Center of the screen y
//var all_cards=[]; //array of cards (field card[2x4],cards in hand[from 0 to 7])


var grabbed_card = false; //Tells if we have a card in our hand and cannot take another one

var arrayImg = new Array(); //array of images, need a loading function of all the images in the folder cards (TO-DO)
var field;
var hand_cards;
var floatingHandCard = undefined;

function onResize(){
	canvas.width = window.innerWidth; //resize canvas!
	canvas.height = window.innerHeight;
	//size factor
	sizeFactor = canvas.width/1536;
	
	//Trash code
	//card elements:
	card_elements.card_lenght_x = 160*sizeFactor;
	card_elements.card_lenght_y = 240*sizeFactor;
	card_elements.top_space_card = 30*sizeFactor;
	card_elements.image_space_card = 110*sizeFactor;
	card_elements.comment_card = 70*sizeFactor;
	card_elements.atk_def_rank = 30*sizeFactor;
	card_elements.atk_def_gap = 60*sizeFactor;
	
	//field elements:
	field.gap_from_border = 50*sizeFactor;
	field.padding = 10*sizeFactor;
	field.pos_width = card_elements.card_lenght_x+(field.padding*2);
	field.pos_height = card_elements.card_lenght_y+(field.padding*2);
	
	field.x = canvas.width/2 - (card_elements.card_lenght_x+(field.padding*2))*(field.n_of_pos/2);
	field.y = 10*sizeFactor;
	
	//hand cards elements:
	hand_cards.gap = 50*sizeFactor;
	hand_cards.bottomPadding = 10*sizeFactor;
	
	field.onResize();
	hand_cards.onResize();
	
}


/*
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

function Card(x,y,name,level,comment,atk,life,img){ //Create and draw the card
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
		
		ctx.drawImage(img,this.x,this.y+card_elements.top_space_card,card_elements.card_lenght_x,card_elements.image_space_card); //image
		
		
		
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
*/

/*
function Field() {
	
	this.fieldCards = new Array();
	this.collisionMasks = new Array();
	
	this.gap_from_border = 50*sizeFactor;
	this.n_of_pos = 4; //( pos = where you place a card )
	this.lines = 2;
	this.padding = 10*sizeFactor;
	this.pos_width = card_elements.card_lenght_x+(this.padding*2);
	this.pos_height = card_elements.card_lenght_y+(this.padding*2);
	
	this.x = canvas.width/2 - (card_elements.card_lenght_x+(this.padding*2))*(this.n_of_pos/2);
	this.y = 10*sizeFactor;
	
	this.fieldArea = new Rectangle(this.x,this.y,this.pos_width*this.n_of_pos,this.pos_height*this.lines);
	
	for(var j=0;j<=1;j++){
		for(var i=0;i<this.n_of_pos;i++){
			this.collisionMasks[j+""+i] = new Rectangle(this.x + this.pos_width*i,this.y + this.pos_height*j,this.pos_width,this.pos_height);
		}
	}
	
	this.draw = function(){
		
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
	
	this.drawFieldCards = function(){
		for(var j=0;j<=1;j++){
			for(var i=0;i<field.n_of_pos;i++){
				if(this.fieldCards[j+""+i] != undefined){
					this.fieldCards[j+""+i].draw();
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
	
	this.onResize = function(){
		this.x = canvas.width/2 - (card_elements.card_lenght_x+(this.padding*2))*(this.n_of_pos/2);
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
				}
			}
		}
		
	}
	
};
*/

/*
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
*/




//Looping function -- Work in here for the game logic
function animate(){
	requestAnimationFrame(animate);
	
	
	ctx.clearRect(0,0,innerWidth,innerHeight);
	
	//Nova card game text
	global_x = canvas.width/2; 
	global_y = canvas.height/2;
	ctx.textAlign = "center";
	ctx.font = (30*sizeFactor)+"px Consolas";
	ctx.fillStyle = "silver";
	//ctx.fillStyle = 'white';
	ctx.fillText("Nova Card Game",global_x,global_y);
	
	//Update position of hand cards
	hand_cards.updateHandPosition();
	
	//Update hand cards
	hand_cards.updateHandCards();
	
	//Update field cards
	field.updateFieldCards();
	
	//Draw the field
	field.draw();
	
	//Draw field cards
	field.drawFieldCards();
	
	//Draw hand cards
	hand_cards.drawHandCards();
	
}





function startMatch(){
	canvas.width = window.innerWidth; //resize canvas!
	canvas.height = window.innerHeight;
	
	
	imgs = loadImages(imageURLs); //Load images

	field = new Field();
	hand_cards = new HandCards();
	//just 4 cards to try push method
	
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Emperor of Fire Destiny",7,"[Taunt] Death: destroy a random card in the field.",99,99,imgs[0].img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"It.",66,"[???] Magic: destroy all other monsters on the table.","1","?",imgs[1].img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol",35,"[???] ???: destroy a random card; bla bla bla, fill the card with something, I like pasta and this monster is strong enough to kick your ass!","X","X",imgs[0].img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Wat",35,"I like pasta.","X","X",imgs[2].img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol3",35,"[???] ???: destroy a random card.","X","X",imgs[0].img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol4",35,"[???] ???: destroy a random card.","X","X",imgs[0].img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol5",35,"[???] ???: destroy a random card.","X","X",imgs[0].img));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol6",35,"[???] ???: destroy a random card.","X","X",imgs[0].img));
	//hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol7",35,"[???][???: destroy a random card]","X","X",img));
	//hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol8",35,"[???][???: destroy a random card]","X","X",img));
	
	animate();
	
}

function loadingURLs(){
	//simulate loading cards (arriving from server)
	imageURLs.push("cards/Emperor of Fire Destiny.png");
	imageURLs.push("cards/It..png");
	imageURLs.push("cards/wat.png");
	startMatch();
}

// Load images
function loadImages(imagefiles) {
    // Initialize variables
    loadcount = 0;
    loadtotal = imagefiles.length;
    preloaded = false;
 
    // Load the images
    var loadedimages = [];
    for (var i=0; i<imagefiles.length; i++) {
        // Create the image object
        var image = new Image();
 
        image.onload = function () {
            loadcount++;
            if (loadcount == loadtotal) {
                // Done loading
                preloaded = true;
            }
        };
 
        // Set the source url of the image
        image.src = imagefiles[i];
		image.onerror =  function(){ alert('Some images could not be loaded.'); }; //error handler, just to make sure everything is fine (but preloaded=false is the same thing)
        // Save to the image array
        loadedimages[i] = {
			img: image,
			name: imagefiles[i].substr(imagefiles[i].indexOf("/")+1,imagefiles[i].length-4)
		}
    }
 
    // Return an array of images
    return loadedimages;
}