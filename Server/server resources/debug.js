function testNotif(){
    var callback = function(e,name){
        alert(name +" function - "+e.target.innerHTML);
    }
    var callback2 = function(e,message,name){
        alert(name +" function - "+message);
    }
    buttons = [];
    buttons.push(new NotificationButton("Got It",callback, {background: "green"}, "Got It"));
    buttons.push(new NotificationButton("Maybe Not",callback, {background: "red"}, "Maybe Not" ));
    buttons.push(new NotificationTextbox("Poop",callback2, {placeholder: "Send some poop",secondButtonText: "Poop, fuck yeah"}, {notEmpty:true}, "Poop" ));
    buttons.push(new NotificationButton("Look at the icon!",callback, null, "Look!"));
    var imgRandomData = ["http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/sign-check-icon.png","http://zedmartinez.com/wp-content/themes/exchange-6/images/info.png"];
    var notifData = {
        text: document.getElementById("chatinput").value,
        img: imgRandomData[Math.round(Math.random())]
    };
    var notif = new FloatingNotification(notifData,buttons);
    notif.show();
}