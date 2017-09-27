/*
A notification popup that can show some text with an image and some buttons with a callback for each one.
It's possibile to set how long the notification should stay on the screen and the style for the div with the options parameters
PARAMETERS
data = {text:"some text", img: "link-to-img" || Image} || "some text": String
buttons = [NotificationButton, NotificationButton,...]
options = {time: any(number || string)[in ms], style: object[with css style parameters] }
*/
function FloatingNotification(data,buttons,options){

    this.timeoutID = undefined;

    if(typeof data == "object"){
        this.text = data.text || "Nova Card Game Notification!";
        if(typeof data.img == "string"){
            this.img = new Image();
            this.img.onerror = function(){
                this.img = undefined;
            }.bind(this);
            this.img.src = data.img;
        }
        else{
            this.img = data.img;
        }
    }
    else{
        this.text = data || "Nova Card Game Notification!";
    }

    

    this.container = document.createElement("div");
    this.container.setAttribute("data-notication","yes");

    var extStyle = {};
    if(options && options.style){
        extStyle = options.style;
        for(var key in extStyle){
            this.container.style[key] = extStyle[key];
        }
    }
    this.container.style.padding = extStyle.padding || "10px";
    this.container.style.margin = extStyle.margin || "0px";
    this.container.style.boxShadow = extStyle.boxShadow || "-2px 2px 2px 2px grey";
    this.container.style.borderRadius = extStyle.borderRadius || "2px 0px 0px 2px";
    this.container.style.position = extStyle.position || "relative";
    /*
    this.container.style.right = extStyle.right || "0px";
    this.container.style.top = extStyle.top || "0px";
    */
    this.container.style.display = "block";
    this.container.style.marginBottom = "0.5em";
    this.container.style.background = extStyle.background || "silver";
    this.container.style.color = extStyle.color || "black";
    this.container.style.minWidth = extStyle.minWidth || "100%";
    this.container.style.overflow = extStyle.overflow || "auto";
    this.container.style.opacity = "0";
    this.container.style.zIndex = "100"; //Forced to be a high value
    

    if(this.img != undefined){
        this.img.setAttribute("padding","1em");
        this.img.setAttribute("width","1em");
        this.img.setAttribute("height","1em");
        this.img.style.display = "inline";
        this.container.appendChild(this.img);
    }

    this.textElement = document.createElement("h4");
    this.textElement.innerText = this.text;
    this.textElement.style.padding = "1em";
    this.textElement.style.display = "inline";
    this.container.appendChild(this.textElement);

    this.wrappingFunction = function(e,callback){
        if(this.timeoutID) {
            clearTimeout(this.timeoutID);
        }
        
        callback(e);

        this.disappear(300);
        
    }.bind(this);


    this.buttonsContainer = document.createElement("div");
    this.buttonsContainer.style.position = "relative";
    this.buttonsContainer.style.right = "0px";
    this.buttonsContainer.style.bottom = "0px";
    this.buttonsContainer.style.padding = "0.3em";
    this.buttonsContainer.style.marginTop = "0.4em";
    this.buttonsContainer.style.marginRight = "0.4em";
    this.buttonsContainer.style.float = "right";
    for(var index in buttons){
        buttons[index].wrapCallback(this.wrappingFunction);
        this.buttonsContainer.appendChild(buttons[index].getButtonObj());
    }
    this.container.appendChild(this.buttonsContainer);



    this.show = function(){
        var appearingTime = 500;
        if(this.container.style.opacity == 0){
            var macroContainer = document.body.querySelector("[data-notification-div=yes]");
            if(!macroContainer){
                macroContainer = document.createElement("div");
                macroContainer.setAttribute("data-notification-div", "yes");
                macroContainer.style.position = "fixed";
                macroContainer.style.right = "0px";
                macroContainer.style.top = "0px";
                macroContainer.style.minWidth = "30%";
                macroContainer.style.maxWidth = "30%";
                macroContainer.style.width = "30%";
                document.body.appendChild(macroContainer);
            }
            macroContainer.appendChild(this.container);
        }
        if(this.container.style.opacity < 1){
            var timePerFrame = 16;
            this.container.style.opacity -= -1*timePerFrame/appearingTime;
            setTimeout(function(){this.show();}.bind(this),timePerFrame);
        }
        else{
            this.container.style.opacity = "1";
            var time = options ? (options.time || 8000) : 8000;
            this.timeoutID = setTimeout(function(){this.disappear(1000);}.bind(this),time);
        }
    }

    this.disappear = function(time){
        if(this.container.style.opacity > 0){
            var timePerFrame = 16;
            this.container.style.opacity -= timePerFrame/time;
            this.timeoutID = setTimeout(function(){this.disappear(time);}.bind(this),timePerFrame);
        }
        else{
            this.container.remove();
        }
    }


}

var NotificationButton = function(text,callback,cssStyle){
    this.btn = document.createElement("button");
    if(cssStyle == undefined){
        cssStyle = {};
    }
    for(var key in cssStyle){
        this.btn.style[key] = cssStyle[key];
    }
    this.btn.style.display = cssStyle.display || "inline-block";
    this.btn.style.paddingTop = cssStyle.paddingTop || "0.2em";
    this.btn.style.paddingBottom = cssStyle.paddingBottom || "0.2em";
    this.btn.style.marginLeft = cssStyle.marginLeft || "5px";
    this.btn.style.marginRight = cssStyle.marginRight || "5px";
    this.btn.style.boxShadow = cssStyle.boxShadow || "-2px 2px 2px 2px grey";
    this.btn.style.borderRadius = cssStyle.borderRadius || "2px 2px 2px 2px";
    this.btn.style.border = cssStyle.border || "0px";
    this.btn.style.background = cssStyle.background || "white";
    this.btn.style.color = cssStyle.color || "black";
    this.btn.innerText = text;
    this.callback = callback;
    this.btn.onclick = callback;

    this.wrapCallback = function(wrappingFunction){
        this.btn.onclick = function(e){wrappingFunction(e,this.callback);}.bind(this);
    }.bind(this);

    this.getButtonObj = function(){
        return this.btn;
    }.bind(this);
}


