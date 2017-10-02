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
    this.container.style.display = "block";
    this.container.style.marginBottom = "0.5em";
    this.container.style.background = extStyle.background || "silver";
    this.container.style.color = extStyle.color || "black";
    this.container.style.minWidth = extStyle.minWidth || "100%";
    this.container.style.overflow = extStyle.overflow || "hidden";
    this.container.style.opacity = "0";
    this.container.style.zIndex = "100"; //Forced to be a high value

    this.closeBtn = document.createElement("h6");
    this.closeBtn.innerHTML = "X";
    this.closeBtn.style.position = "absolute";
    this.closeBtn.style.right = "0px";
    this.closeBtn.style.top = "0px";
    this.closeBtn.style.padding = "0px 2em 0.5em 0.5em";
    this.closeBtn.style.margin = "0px";
    this.closeBtn.style.cursor = "pointer";
    this.closeBtn.style.fontFamily="Consolas,monospace";
    this.closeBtn.style.fontSize="0.9em";
    this.closeBtn.onclick = function(){
        this.disappear(300);
    }.bind(this);
    this.container.appendChild(this.closeBtn);
    
	if(this.img != undefined){
        this.img.style.padding = "0.2em";
        this.img.style.width = "1em";
        this.img.style.height = "1em";
        this.img.style.display = "inline";
		this.img.style.verticalAlign = "bottom";
		this.img.style.position = "relative";
		this.img.style.bottom = "-2px";
        this.container.appendChild(this.img);
    }
	
	
	this.textElement = document.createElement("h4");
    this.textElement.innerText = this.text;
    this.textElement.style.padding = "1em 1em 1em 0.3em";
    this.textElement.style.display = "inline";
	this.textElement.style.wordWrap = "work-break";
	this.textElement.style.overflowWrap = "work-break";
    this.container.appendChild(this.textElement);

    this.wrappingBtnFunction = function(e,callback,callbackArgs){
        if(this.timeoutID) {
            clearTimeout(this.timeoutID);
        }
        this.container.style.opacity = 1;
        
        callback(e,...callbackArgs); // "...something is the spread operator"

        this.disappear(300);
        
    }.bind(this);


    this.wrappingTextboxFunction = function(e,button,callbackArgs){
        if(this.timeoutID) {
            clearTimeout(this.timeoutID);
        }
        this.container.style.opacity = 1;

        for(var index in buttons){
            buttons[index].getButtonObj().remove();
        }

        this.buttonsContainer.appendChild(button.getTextboxObj());
        this.buttonsContainer.appendChild(button.getButtonObj());
        button.getButtonObj().innerText = button.secondBtnText;
        button.getTextboxObj().focus();
        button.getButtonObj().onclick = function(e){
            if(!button.options.notEmpty || (button.options.notEmpty && button.getTextboxObj().value.trim() != "")){
                button.callback(e,button.getTextboxObj().value,...callbackArgs);
                this.disappear(300);
            }
        }.bind(this);

        
    }.bind(this);


    if(buttons && buttons.length > 0){
        this.buttonsContainer = document.createElement("div");
        this.buttonsContainer.style.position = "relative";
        this.buttonsContainer.style.right = "0px";
        this.buttonsContainer.style.bottom = "0px";
        this.buttonsContainer.style.padding = "0.3em";
        this.buttonsContainer.style.marginTop = "0.4em";
        this.buttonsContainer.style.marginRight = "0.4em";
        this.buttonsContainer.style.float = "right";
        for(var index in buttons){
            if(buttons[index].type == "NotificationTextbox"){
                buttons[index].wrapCallback(this.wrappingTextboxFunction);
            }
            else{
                buttons[index].wrapCallback(this.wrappingBtnFunction);
            }
            this.buttonsContainer.appendChild(buttons[index].getButtonObj());
        }
        this.container.appendChild(this.buttonsContainer);
    }



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
                macroContainer.style.minWidth = "35%";
                macroContainer.style.maxWidth = "35%";
                macroContainer.style.width = "35%";
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


/*
The notificationButton object is a button then when clicked fires a callback
Parameters: 
    text = the text of the button
    callback = function that gets called when user submit the text from the text box. It recieves the event of the click
    cssStyle = an object with obj.style properties to customize the button aspect
    ...anyArgs to pass to the callback
*/
var NotificationButton = function(text,callback,cssStyle){
    this.type = "NotificationButton";
    this.callback = callback;
    this.args = [].slice.call(arguments,3); //Array with any other parameters other than the 3 listed
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
    this.btn.style.cursor = cssStyle.cursor || "pointer";
    this.btn.innerText = text;
    this.btn.onclick = callback;

    this.wrapCallback = function(wrappingFunction){
        this.btn.onclick = function(e){
            wrappingFunction(e,this.callback,this.args);
        }.bind(this);
    }.bind(this);

    this.getButtonObj = function(){
        return this.btn;
    }.bind(this);
}

/*
The notificationTextbox object is a button then when clicked becomes a text box where the user can input some text
Parameters: 
    text = the text of the first showing button
    callback = function that gets called when user submit the text from the text box. It recieves the event and the submitted text
    cssStyle = an object with obj.style properties to customize the button and the textbox aspect. It has to external parameters
        placeholder = the textbox placeholde, by default is the firs parameter text
        secondButtonText = the text of the submit button beside the thextbox
    options = obect with {notEmpty = the textbox can't be empty when firing the callback}
    ...anyArgs to pass to the callback
*/
var NotificationTextbox = function(text,callback,cssStyle,options){
    this.type = "NotificationTextbox";
    this.callback = callback;
    this.options = options || {notEmpty:false};
    this.args = [].slice.call(arguments,4); //Array with any other parameters other than the 3 listed
    this.btn = document.createElement("button");
    this.textbox = document.createElement("input");
    this.textbox.setAttribute("type","text");

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
    this.btn.style.cursor = cssStyle.cursor || "pointer";
    this.btn.innerText = text;
    this.secondBtnText = cssStyle.secondButtonText || text;
    this.btn.onclick = callback;


    for(var key in cssStyle){
        this.textbox.style[key] = cssStyle[key];
    }
    this.textbox.style.display = cssStyle.display || "inline-block";
    this.textbox.style.minWidth = cssStyle.display || "50%";
    this.textbox.style.paddingTop = cssStyle.paddingTop || "0.2em";
    this.textbox.style.paddingBottom = cssStyle.paddingBottom || "0.2em";
    this.textbox.style.marginLeft = cssStyle.marginLeft || "5px";
    this.textbox.style.marginRight = cssStyle.marginRight || "5px";
    this.textbox.style.boxShadow = cssStyle.boxShadow || "-2px 2px 2px 2px grey";
    this.textbox.style.borderRadius = cssStyle.borderRadius || "2px 2px 2px 2px";
    this.textbox.style.border = cssStyle.border || "0px";
    this.textbox.style.background = cssStyle.background || "white";
    this.textbox.style.color = cssStyle.color || "black";
    this.textbox.setAttribute("placeholder", cssStyle.placeholder || text);

    var keyUp = function(e){
        if(e.keyCode == 13){
            this.btn.onclick(e);
        }
    }.bind(this);
    this.textbox.onkeyup = keyUp;

    this.wrapCallback = function(wrappingFunction){
        this.btn.onclick = function(e){
            wrappingFunction(e,this,this.args);
        }.bind(this);
    }.bind(this);

    this.getButtonObj = function(){
        return this.btn;
    }.bind(this);

    this.getTextboxObj = function(){
        return this.textbox;
    }.bind(this);
}


