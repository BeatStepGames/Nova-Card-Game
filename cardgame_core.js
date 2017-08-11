var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");
var global_x;
var global_y;
var all_cards=[]; //array of cards (field card[2x4],cards in hand[from 0 to 7])
var grabbed_card = false; //Tells if we have a card in our hand and cannot take another one

var arrayImg = new Array(); //array of images, need a loading function of all the images in the folder cards (TO-DO)

var card_elements = { //width and height of all elements in card
	card_lenght_x: 160,
	card_lenght_y: 240,
	top_space_card: 30,
	image_space_card: 110,
	comment_card: 70,
	atk_def_rank: 30
};

var mouse = { //mouse position every istant
	x: undefined,
	y: undefined,
	clicked: false,
	click_x: undefined, //mouse position clicked
	click_y: undefined
};

var hand_cards = { //position of the cards in hand
	x: 100,
	y: 600, // 600+ to put them outside the screen (need a method to create a scrollbar when happens!(TO-DO: you need to solve this Pasquale))
	gap: 10
};

window.addEventListener('mousemove', //mouse position every istant listener
	function(event){ 
		mouse.x = event.x;
		mouse.y = event.y;
	});

window.addEventListener('mousedown',
	function(event){
		mouse.clicked = true;
		mouse.click_x = event.x;
		mouse.click_y = event.y;
	});

window.addEventListener('mouseup',
	function(event){
		mouse.clicked = false;
		mouse.click_x = event.x;
		mouse.click_y = event.y;
	});


//card

var vel = 4; //velocity

function Card(x,y,name,level,comment,atk,life,img){ //Create and draw the card
	this.x = x;
	this.y = y;
	this.name = name;
	this.level = level;
	this.comment = comment;
	this.atk = atk;
	this.life = life;
	var moving =0; //Ex flag, this one is a better name
	var temp_x;
	var temp_y;
	
	this.draw = function(){ //Do not touch that ლ(ಠ_ಠლ)
		var width_m;
		var height_m;
		ctx.beginPath();
		ctx.textAlign = "center";
		ctx.fillStyle = 'black';
		ctx.fillRect(this.x,this.y,card_elements.card_lenght_x,card_elements.card_lenght_y);
		
		ctx.strokeStyle='silver';
		ctx.rect(this.x,this.y,card_elements.card_lenght_x-card_elements.top_space_card, card_elements.top_space_card); //name part
		//INCONSISTENCY, YOU SET 2 COLORS WITHOUT USING ONE OF THEM
		//ctx.fillStyle = 'white'; //text color
		ctx.font="12px Arial";
		ctx.fillStyle = "silver";
		//INCONSISTENCY, NEVER USED WIDTH_M WITH THIS VALUE
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
		if(mouse.clicked && !grabbed_card && mouse.x>=this.x && mouse.x<=this.x+card_elements.card_lenght_x && mouse.y>=this.y && mouse.y<=this.y+card_elements.card_lenght_y && moving == 0){
			console.log("clicked!");
			moving = 1;
			temp_x = mouse.x-this.x;
			temp_y = mouse.y-this.y;
			grabbed_card = true; //We grabbed a card, no other cards can be grabbed now
			
			
		}
		if(moving == 1){
			this.x = mouse.x-temp_x;
			this.y = mouse.y-temp_y;
		}
		
		//If mouse is not clicked anymore but card is in moving state, fix the card where it is
		if(mouse.clicked == false && moving == 1){
			moving = 0;
			grabbed_card = false; //Reset grabbed card, so that we can grab other crads
		}

		this.draw();
	}
}

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
	
	all_cards[0].update();
	all_cards[1].update();
	all_cards[2].update();
	all_cards[3].update();
	//ctx.fillRect(x_card,0,150,220);
	
	
	//x_card +=vel;
}





function start(){
	img=new Image();
		
	img.onload=function(){
		animate();
	}

	//just 4 cards to try push method

	all_cards.push(new Card(hand_cards.x,hand_cards.y,"Emperor of Fire Destiny",7,"[Taunt][Death: destroy a random card in the field]",99,99,img));
	all_cards.push(new Card(hand_cards.x + card_elements.card_lenght_x + hand_cards.gap,hand_cards.y,"Bobby",80,"[???][???: destroy a random card]","X","X",img));
	all_cards.push(new Card(hand_cards.x + (card_elements.card_lenght_x + hand_cards.gap)*2,hand_cards.y,"Lol",35,"[???][???: destroy a random card]","X","X",img));
	all_cards.push(new Card(hand_cards.x + (card_elements.card_lenght_x + hand_cards.gap)*3,hand_cards.y,"Lol",35,"[???][???: destroy a random card]","X","X",img));

	img.src='cards/Emperor of Fire Destiny.png';
}
