class GameObject {

    constructor(x,y,width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.originalWidth = width;
        this.originalHeight = height;
    }

    draw(context){
    }

    update(){
    }

    onResize(sizeFactor){
        this.width = this.originalWidth*sizeFactor;
        this.height = this.originalHeight* sizeFactor;
    }
}