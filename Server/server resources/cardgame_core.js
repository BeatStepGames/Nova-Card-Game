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
	canvas.width = window.innerWidth*devicePixelRatio; //resize canvas!
	canvas.height = window.innerHeight*devicePixelRatio;
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
	if(field){
		field.gap_from_border = 50*sizeFactor;
		field.padding = 10*sizeFactor;
		field.pos_width = card_elements.card_lenght_x+(field.padding*2);
		field.pos_height = card_elements.card_lenght_y+(field.padding*2);
		
		field.x = canvas.width/2 - (card_elements.card_lenght_x+(field.padding*2))*(field.n_of_pos/2);
		field.y = 10*sizeFactor;
		
		field.onResize();
	}
	
	//hand cards elements:
	if(hand_cards){
		hand_cards.gap = 50*sizeFactor;
		hand_cards.bottomPadding = 10*sizeFactor;
		
		
		hand_cards.onResize();
	}
	
	
	
}

//Looping function -- Work in here for the game logic
function animate(){
	requestAnimationFrame(animate);
	
	
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
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



var deckIndex = 1;


function startMatch(){
	//resize canvas!
	onResize();
	//canvas.width = window.innerWidth; 
	//canvas.height = window.innerHeight;

	field = new Field();
	hand_cards = new HandCards();
	
	server.register("requestdeck",requestDeckHandler);
	server.requestDeck(deckIndex,6);
	
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Emperor of Fire Destiny",7,"[Taunt] Death: destroy a random card in the field.",99,99,"card_images/Emperor of Fire Destiny.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"It.",66,"[???] Magic: destroy all other monsters on the table.","1","?","card_images/It..png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol",35,"[???] ???: destroy a random card; bla bla bla, fill the card with something, I like pasta and this monster is strong enough to kick your ass!","X","X","card_images/Emperor of Fire Destiny.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Wat",35,"I like pasta.","X","X","card_images/wat.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol3",35,"[???] ???: destroy a random card.","X","X","card_images/Emperor of Fire Destiny.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol4",35,"[???] ???: destroy a random card.","X","X","card_images/Emperor of Fire Destiny.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol5",35,"[???] ???: destroy a random card.","X","X","card_images/Emperor of Fire Destiny.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol6",35,"[???] ???: destroy a random card.","X","X","card_images/Emperor of Fire Destiny.png"));
	//hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol7",35,"[???][???: destroy a random card]","X","X",img));
	//hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol8",35,"[???][???: destroy a random card]","X","X",img));
	
	animate();
	
}

function requestDeckHandler(params){
	var deck = JSON.parse(params);
	
}