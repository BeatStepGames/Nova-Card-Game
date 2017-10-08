var matchRunning = false;
var canvas = document.getElementById("matchCanvas");
canvas.width = window.innerWidth; //resize canvas!
canvas.height = window.innerHeight;

// Image loading global variables
var loadcount = 0;
var loadtotal = 0;
var preloaded = false;
var imageURLs = [];
var imgs = [];

var baseDimensions = { //width and height of all elements in card
	original_card_height: 240,
	original_card_width: 160,
	card_width: 160*sizeFactor,
	card_height: 240*sizeFactor,
	top_space_card: 30*sizeFactor,
	image_space_card: 110*sizeFactor,
	comment_card: 70*sizeFactor,
	atk_def_rank: 30*sizeFactor,
	atk_def_gap: 60*sizeFactor
};

var ctx = canvas.getContext("2d");
var global_x; //Center of the screen x
var global_y; //Center of the screen y
//var all_cards=[]; //array of cards (field card[2x4],cards in hand[from 0 to 7])


var grabbed_card = false; //Tells if we have a card in our hand and cannot take another one

var arrayImg = new Array(); //array of images, need a loading function of all the images in the folder cards (TO-DO)
var field;
var hand_cards;
var floatingHandCard = undefined;
var matchServerRequestsID = {
	deckHandlerID: undefined,
	cardHandlerID: undefined
}

function onResize(){
	canvas.width = window.innerWidth*devicePixelRatio; //resize canvas!
	canvas.height = window.innerHeight*devicePixelRatio;
	//size factor
	sizeFactor = canvas.width/1536; 

	baseDimensions.card_height =  baseDimensions.original_card_height*sizeFactor;
	baseDimensions.card_width =  baseDimensions.card_height*(2/3);
	baseDimensions.top_space_card = baseDimensions.card_height*(1/8);
	baseDimensions.image_space_card = baseDimensions.card_height*(11/24);
	baseDimensions.comment_card = baseDimensions.card_height*(7/24);
	baseDimensions.atk_def_rank = baseDimensions.card_height*(1/8);
	baseDimensions.atk_def_gap = baseDimensions.card_height*(1/4);
	
	//field elements:
	if(field){
		/*
		field.gap_from_border = 50*sizeFactor;
		field.padding = 10*sizeFactor;
		field.pos_width = baseDimensions.card_width+(field.padding*2);
		field.pos_height = baseDimensions.card_height+(field.padding*2);
		
		field.x = canvas.width/2 - (baseDimensions.card_width+(field.padding*2))*(field.n_of_pos/2);
		field.y = 10*sizeFactor;
		*/

		field.x = canvas.width/2;
		field.y = canvas.height*(1/3);

		field.onResize(sizeFactor);
	}
	
	//hand cards elements:
	if(hand_cards){
		hand_cards.gap = 50*sizeFactor;
		hand_cards.bottomPadding = 10*sizeFactor;
		
		
		hand_cards.onResize(sizeFactor);
	}
	
	
	
}

//Looping function -- Work in here for the game logic
function animate() {
	if (matchRunning) {
		requestAnimationFrame(animate);


		ctx.clearRect(0, 0, canvas.width, canvas.height);

		//Nova card game text
		global_x = canvas.width / 2;
		global_y = canvas.height / 2;
		ctx.textAlign = "center";
		ctx.font = (30 * sizeFactor) + "px Consolas";
		ctx.fillStyle = "silver";
		//ctx.fillStyle = 'white';
		ctx.fillText("Nova Card Game", global_x, global_y);

		//Update position of hand cards
		hand_cards.updateHandPosition();

		//Update hand cards
		hand_cards.updateHandCards();

		//Update field cards
		field.updateFieldCards();

		//Draw the field
		field.draw(ctx);

		//Draw field cards
		field.drawFieldCards(ctx);

		//Draw hand cards
		hand_cards.drawHandCards(ctx);

	}

}



var deckIndex = 1;


function startMatch(){
	//resize canvas!
	//onResize();

	field = new Field(canvas.width/2, canvas.height*(1/3), baseDimensions.original_card_width, baseDimensions.original_card_height, 2, 4);
	hand_cards = new HandCards();
	
	matchServerRequestsID.deckHandlerID = server.register("requestdeck",requestDeckHandler);
	matchServerRequestsID.cardHandlerID = server.register("requestcard",requestCardHandler);
	server.requestDeck(deckIndex,6);
	
	/*
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,baseDimensions.original_card_height,"Emperor of Fire Destiny",7,"[Taunt] Death: destroy a random card in the field.",99,99,"card_images/Emperor of Fire Destiny.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,baseDimensions.original_card_height,"It.",66,"[???] Magic: destroy all other monsters on the table.","1","?","card_images/It..png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,baseDimensions.original_card_height,"Lol",35,"[???] ???: destroy a random card; bla bla bla, fill the card with something, I like pasta and this monster is strong enough to kick your ass!","X","X","card_images/Emperor of Fire Destiny.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,baseDimensions.original_card_height,"Wat",35,"I like pasta.","X","X","card_images/Wat.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,baseDimensions.original_card_height,"Lol3",35,"[???] ???: destroy a random card.","X","X","card_images/Emperor of Fire Destiny.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,baseDimensions.original_card_height,"Lol4",35,"[???] ???: destroy a random card.","X","X","card_images/Emperor of Fire Destiny.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,500,"Emperor of Fire Destiny",35,"[???] ???: destroy a random card; bla bla bla, fill the card with something, I like pasta and this monster is strong enough to kick your ass!","X","X","card_images/Emperor of Fire Destiny.png"));
	hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,150,"Lol6",35,"[???] ???: destroy a random card.","X","X","card_images/Emperor of Fire Destiny.png"));
	//hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol7",35,"[???][???: destroy a random card]","X","X",img));
	//hand_cards.handStack.push(new Card(canvas.width,hand_cards.y,"Lol8",35,"[???][???: destroy a random card]","X","X",img));
	*/
	
	onResize();
	matchRunning = true;
	animate();
	
}

function stopMatch(){
	field = undefined;
	hand_cards = undefined;
	ctx.clearRect(0,0,canvas.width,canvas.height);
	server.deleteCallback("requestdeck",matchServerRequestsID.deckHandlerID);
	server.deleteCallback("requestcard",matchServerRequestsID.cardHandlerID);
	matchRunning = false;
}

function requestDeckHandler(data){
	var deck = JSON.parse(data);
	for(var i=0; i<deck.length; i++){
		server.requestCard(deck[i]);
	}
}

function requestCardHandler(cardData){
	if(cardData != "ERROR 404: Not Found"){
		cardData = JSON.parse(cardData);
		hand_cards.handStack.push(
			new Card(
				canvas.width,
				hand_cards.y-baseDimensions.card_height,
				baseDimensions.original_card_height,
				cardData.name,
				cardData.level,
				cardData.comment,
				cardData.atk,
				cardData.def,
				"card_images/"+cardData.name+".png",
				sizeFactor
			)
		);
		console.log(cardData);
	}
	else{
		console.log("Card requested doesn't exist!");
	}
}