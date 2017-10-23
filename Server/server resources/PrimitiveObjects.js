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
	
	getCenterX(){
        return this.centerX;
    }

    getCenterY(){
        return this.centerY;
    }
    
    setCenterX(centerX){
        this.centerX = centerX;
        this.x = centerX - (this.width/2)
    }

    setCenterY(centerY){
        this.centerY = centerY;
        this.y = centerY - (this.height/2)
    }

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    setX(x){
        this.x = x;
        this.centerX = x + (this.width/2);
    }

    setY(y){
        this.y = y;
        this.centerY = y + (this.height/2);
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
	
	zoom(finalWidth, finalHeight, steps, callback){
        let deltaWidth = (finalWidth-this.width)/steps;
        let deltaHeight = (finalHeight-this.height)/steps;

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
	/* NOT WORKING...
	rotation(angle, isAntiClockWise, steps, context, callback){ //isAntiClockWise = true -> rotate in opposite direction ; false -> e.g. the direction of the clock
        let deltaAngle = (angle/steps)*Math.PI/180;

        var Executor = function(obj){
            this.deltaAngle = deltaAngle;
			this.startAngle = deltaAngle;
            this.totalSteps = steps;
            this.currentStep = 0;
            this.active = true;
            this.obj = obj;
            this.callback = callback;
			this.context = context;

            this.execute = function(){
                if(this.currentStep < this.totalSteps){
                    this.currentStep++;
                    
					ctx.save();
					this.context.rotate(this.startAngle*Math.PI/180);
					
					this.obj.draw(this.context);
					
                    this.obj.onResize(this.obj.width/this.obj.originalWidth);
					
					this.startAngle += this.deltaAngle;
					ctx.restore();
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
	*/
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