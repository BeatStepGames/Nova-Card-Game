//Global obejct ID manager

var IDManager = {
	nextID: 0,
	getUniqueID: function(){
		this.nextID++;
		return this.nextID;
	}
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
		mouse.x = event.x;
		mouse.y = event.y;
		if(mouse.mouseMove != undefined){
			mouse.mouseMove();
		}
	}
);

window.addEventListener('mousedown',
	function(event){
		mouse.clicked = true;
		mouse.click_x = event.x;
		mouse.click_y = event.y;
		if(mouse.mouseDown != undefined){
			mouse.mouseDown();
		}
	}
);

window.addEventListener('mouseup',
	function(event){
		mouse.clicked = false;
		mouse.click_x = event.x;
		mouse.click_y = event.y;
		if(mouse.mouseUp != undefined){
			mouse.mouseUp();
		}
		if(mouse.click != undefined){
			mouse.click();
		}
	}
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





