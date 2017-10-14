class GameObject {

    constructor(x,y,width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.originalWidth = width;
        this.originalHeight = height;
		
		this.animationList = [];
    }

    draw(context){
		for(let i in this.animationList){
            if(this.animationList[i].active){
                this.animationList[i].execute();
            }
            else{
                this.animationList.splice(i,1);
            }
        }
    }

    update(){
    }

    onResize(sizeFactor){
        this.width = this.originalWidth*sizeFactor;
        this.height = this.originalHeight* sizeFactor;
    }
	
	zoom(ratio,steps,increment,callback){
		let deltaWidth = (this.originalWidth*ratio-this.originalWidth)/steps;
        let deltaHeight = (this.originalHeight*ratio-this.originalHeight)/steps;
		
		var Executor = function(obj){
            this.deltaWidth = deltaWidth;
            this.deltaHeight = deltaHeight;
            this.totalSteps = steps;
            this.currentStep = 0;
            this.active = true;
            this.obj = obj;
            this.callback = callback;

            this.execute = function(){
                if(this.currentStep < this.totalSteps){
                    this.currentStep++;
                    this.obj.originalWidth += this.deltaWidth;
                    this.obj.originalHeight += this.deltaHeight;
					this.obj.width += this.deltaWidth;
                    this.obj.height += this.deltaHeight;
					
					this.obj.x -= this.deltaWidth/2;
					this.obj.y -= this.deltaHeight/2;
					
                    this.obj.onResize(this.obj.width/this.obj.originalWidth);
					
                }
                else{
                    this.active = false;
                    if(this.callback){
                        this.callback();
                    }
                }
            }.bind(this);
        }

        let ex = new Executor(this);
        this.animationList.push(ex);
    }

    isStatic(){
        if(this.animationList.length == 0){
            return true;
        }
        return false;
    }
	
}
	
/*
	
	if (checkTime(time)){
			this.x = this.x - (this.originalWidth*ratio - this.originalWidth)/2;
			this.y = this.y - (this.originalHeight*ratio - this.originalHeight)/2;
			this.originalWidth = this.originalWidth*ratio;
			this.originalHeight = this.originalHeight*ratio;
			this.onResize(sizeFactor);
		}
		
*/