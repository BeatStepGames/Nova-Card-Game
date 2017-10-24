//Global obejct ID manager

var IDManager = {
	nextID: 0,
	getUniqueID: function(){
		this.nextID++;
		return this.nextID;
	}
}

//Detects if we are on a mobile device
var mobilePlatform = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)){
	mobilePlatform = true;
}



//General mouse holder + callbacks methods
var mouse = {
	x: undefined,
	y: undefined,
	clicked: false,
	//Callback methods, override those for callbacks
	mouseDown: undefined,
	mouseUp: undefined,
	click: undefined,
	mouseMove: undefined
};


window.addEventListener('mousemove', //mouse position every istant listener
	function(event){
		mouse.x = event.pageX*devicePixelRatio;
		mouse.y = event.pageY*devicePixelRatio;
		if(mouse.mouseMove != undefined){
			mouse.mouseMove();
		}
	}
);


window.addEventListener('touchmove', //touch position every istant listener
	function(event){
		//event.preventDefault();
		mouse.x = event.touches[0].pageX*devicePixelRatio;
		mouse.y = event.touches[0].pageY*devicePixelRatio;
		if(mouse.mouseMove != undefined){
			mouse.mouseMove();
		}
	},{passive:true}
);


window.addEventListener('mousedown',
	function(event){
		mouse.clicked = true;
		mouse.click_x = event.pageX*devicePixelRatio;
		mouse.click_y = event.pageY*devicePixelRatio;
		if(mouse.mouseDown != undefined){
			mouse.mouseDown();
		}
	}
);


window.addEventListener('touchstart',
	function(event){
		//event.preventDefault();
		mouse.clicked = true;
		mouse.x = event.touches[0].pageX*devicePixelRatio;
		mouse.y = event.touches[0].pageY*devicePixelRatio;
		if(mouse.mouseDown != undefined){
			mouse.mouseDown();
		}
	},{passive:true}
);


window.addEventListener('mouseup',
	function(event){
		mouse.clicked = false;
		mouse.click_x = event.pageX*devicePixelRatio;
		mouse.click_y = event.pageY*devicePixelRatio;
		if(mouse.mouseUp != undefined){
			mouse.mouseUp();
		}
		if(mouse.click != undefined){
			mouse.click();
		}
	}
);


window.addEventListener('touchend',
	function(event){
		//event.preventDefault();
		mouse.clicked = false;
		if(mouse.mouseUp != undefined){
			mouse.mouseUp();
		}
		if(mouse.click != undefined){
			mouse.click();
		}
	},{passive:true}
);



//Stack data structure with no repetitive objects
function Stack(){
	this.length = 0;
	this.array = [];
	
	this.push = function(obj,remove){
		
		if(obj["_stackID"] != undefined){
			if(remove == true){
				/*
				for(var i = 0; i<this.array.length; i++){
					if(this.array[i]._stackID == obj._stackID){
						this.remove(i);
						break;
					}
				}
				*/
				remove(obj._stackID);
			}
		}
		else{
			obj["_stackID"] = IDManager.getUniqueID();
		}
		
		this.array.splice(0,0,obj);
		this.length = this.array.length;
	}
	
	this.pop = function(){
		this.array.splice(0,1);
		this.length = this.array.length;
	}
	
	this.remove = function(ID){
		
		if(ID == undefined){
			this.array.splice(0,this.array.lenght);
			this.length = 0;
			return;
		}
		
		for(var i = 0; i<this.array.length; i++){
			if(this.array[i]._stackID == ID){
				this.array.splice(i,1);
				this.length = this.array.length;
				break;
			}
		}
	}
}


function Rectangle(x,y,width,height){
	
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	
	this.update = function(x,y,width,height){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	this.contains = function(px,py){
		if(px>this.x && px < (this.x+this.width)
		  && py>this.y && py<(this.y+this.height) ){
			return true;
		}
		return false;
	}
	
}





