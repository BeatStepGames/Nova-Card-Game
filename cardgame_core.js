var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");
var card_back = canvas.getContext("2d"); //card canvas
var global_x;
var global_y;
var all_cards=[]; //array of cards (field card[2x4],cards in hand[from 0 to 7])



var card_elements = { //width and height of all elements in card
	card_lenght_x: 160,
	card_lenght_y: 240,
	top_space_card: 30,
	image_space_card: 110,
	comment_card: 70,
	atk_def_rank: 30,
};

var mouse = { //mouse position every istant
	x: undefined,
	y: undefined,
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
	
window.addEventListener('click', //mouse position clicked listener
	function(event){ 
		mouse.click_x = event.x;
		mouse.click_y = event.y;
	});

//card

var vel = 4; //velocity

function Card(x,y,name,level,comment,atk,life){ //Create and draw the card
	this.x = x;
	this.y = y;
	this.name = name;
	this.level = level;
	this.comment = comment;
	this.atk = atk;
	this.life = life;
	var flag =0;
	var temp_x;
	var temp_y;
	
	this.draw = function(){ //Do not touch that ლ(ಠ_ಠლ)
		var width_m;
		var height_m;
		card_back.beginPath();
		card_back.textAlign = "center";
		card_back.fillStyle = 'black';
		card_back.fillRect(this.x,this.y,card_elements.card_lenght_x,card_elements.card_lenght_y);
		
		card_back.strokeStyle='silver';
		card_back.rect(this.x,this.y,card_elements.card_lenght_x-card_elements.top_space_card, card_elements.top_space_card); //name part
		card_back.fillStyle = 'white'; //text color
		card_back.font="12px Arial";
		card_back.fillStyle = "silver";
		width_m = ctx.measureText(this.name).width;
		card_back.fillText(this.name,this.x+(card_elements.card_lenght_x-card_elements.top_space_card)/2,this.y+card_elements.top_space_card/2+2); //name text
		
		card_back.font="18px Arial";
		width_m = ctx.measureText(100 - this.level).width;
		height_m = ctx.measureText("gggg").width;
		card_back.rect(this.x+card_elements.card_lenght_x-card_elements.top_space_card,this.y,card_elements.top_space_card, card_elements.top_space_card); //level part (top right)
		card_back.fillText(this.level,this.x+card_elements.card_lenght_x-card_elements.top_space_card/2,this.y+(height_m/2)); //level number (top right)
		
		
		ctx.drawImage(img,this.x,this.y+card_elements.top_space_card,card_elements.card_lenght_x,card_elements.image_space_card); //image
		card_back.rect(this.x,this.y+card_elements.top_space_card,card_elements.card_lenght_x, card_elements.image_space_card); //image part
		
		card_back.font="11px Arial";
		//var length_text = ctx.measureText(this.comment).width;
		//var str=this.comment.split(' ');
		
		card_back.fillStyle = "white";
		card_back.rect(this.x,this.y+card_elements.top_space_card+card_elements.image_space_card,card_elements.card_lenght_x,card_elements.comment_card); //comment part
		//card_back.fillText(this.comment,this.x,this.y+card_elements.top_space_card+card_elements.image_space_card+10);
		splitNewLine(this.comment,this.x,this.y); //text comment
		
		card_back.font="18px Arial";
		card_back.fillStyle = "red";
		card_back.rect(this.x,this.y+card_elements.top_space_card+card_elements.image_space_card+card_elements.comment_card,card_elements.card_lenght_x,card_elements.atk_def_rank); //atk def ecc. part
		card_back.fillText(this.atk,this.x+(card_elements.card_lenght_x/2)-60,this.y+card_elements.top_space_card+card_elements.image_space_card+card_elements.comment_card+(width_m));
		card_back.fillStyle = "green";
		card_back.fillText(this.life,this.x+(card_elements.card_lenght_x/2)+60,this.y+card_elements.top_space_card+card_elements.image_space_card+card_elements.comment_card+(width_m));
		card_back.stroke();
		
	}
	
	this.update = function(){ //update card in new position
		if(mouse.click_x>=this.x && mouse.click_x<=this.x+card_elements.card_lenght_x && mouse.click_y>=this.y && mouse.click_y<=this.y+card_elements.card_lenght_y && flag == 0){
			console.log("clicked!");
			flag = 1;
			temp_x = mouse.click_x-this.x;
			temp_y = mouse.click_y-this.y;
			
		}
		if(flag == 1){
			this.x = mouse.x-temp_x;
			this.y = mouse.y-temp_y;
		}
		//TO-DO: when clicked again, release the card
		
		//this.x += vel;
		this.draw();
	}
}

//just 4 cards to try push method

all_cards.push(new Card(hand_cards.x,hand_cards.y,"Emperor of Fire Destiny",7,"[Taunt][Death: destroy a random card in the field]",99,99));
all_cards.push(new Card(hand_cards.x + card_elements.card_lenght_x + hand_cards.gap,hand_cards.y,"Bobby",80,"[???][???: destroy a random card]","X","X"));
all_cards.push(new Card(hand_cards.x + (card_elements.card_lenght_x + hand_cards.gap)*2,hand_cards.y,"Lol",35,"[???][???: destroy a random card]","X","X"));
all_cards.push(new Card(hand_cards.x + (card_elements.card_lenght_x + hand_cards.gap)*3,hand_cards.y,"Lol",35,"[???][???: destroy a random card]","X","X"));

function animate(){
	requestAnimationFrame(animate);
	
	canvas.width = window.innerWidth; //resize canvas!
	canvas.height = window.innerHeight;
	
	
	//card_back.clearRect(0,0,innerWidth,innerHeight); //card!
	
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
	//card_back.fillRect(x_card,0,150,220);
	
	
	//x_card +=vel;
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
			card_back.fillText(line,x+card_elements.card_lenght_x/2,y+card_elements.top_space_card+card_elements.image_space_card+11*newl);
			line = array[i] + " ";
			newl++;
		}
	}
	card_back.fillText(line,x+card_elements.card_lenght_x/2,y+card_elements.top_space_card+card_elements.image_space_card+11*newl);
	return;
}

var arrayImg = new Array(); //array of images, need a loading function of all the images in the folder cards (TO-DO)

img=new Image();
		
img.onload=function(){
	animate();
}
img.src='cards/Emperor of Fire Destiny.png';