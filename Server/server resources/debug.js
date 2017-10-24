function testNotif() {
    var callback = function (e, name) {
        alert(name + " function - " + e.target.innerHTML);
    }
    var callback2 = function (e, message, name) {
        alert(name + " function - " + message);
    }
    buttons = [];
    buttons.push(new NotificationButton("Got It", callback, undefined, "Got It"));
    buttons.push(new NotificationButton("Maybe Not", callback, undefined, "Maybe Not"));
    buttons.push(new NotificationTextbox("Poop", callback2, { placeholder: "Send some poop", secondButtonText: "Poop, fuck yeah" }, { notEmpty: true }, "Poop"));
    buttons.push(new NotificationButton("Look at the icon!", callback, null, "Look!"));
    var imgRandomData = ["http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/sign-check-icon.png", "http://zedmartinez.com/wp-content/themes/exchange-6/images/info.png"];
    var notifData = {
        text: document.getElementById("chatinput").value,
        img: imgRandomData[Math.round(Math.random())]
    };
    var notif = new FloatingNotification(notifData, buttons);
    notif.show();
}


//DEBUG LOADER, USED TO LOAD ATTRIBUTES IMGS!

var loadedimages = [];

debugLoader();

function debugLoader(){
	var imgs = [];
	imgs.push("card_attributes/attack.png");
	imgs.push("card_attributes/life.png");
	imgs.push("card_attributes/mana.png");
	imgs.push("card_attributes/pattern.png");
	
	loadImages(imgs);
}

function loadImages(imagefiles) {
    // Initialize variables
    loadcount = 0;
    loadtotal = imagefiles.length;
    preloaded = false;
 
    // Load the images
    //var loadedimages = [];
    for (var i=0; i<imagefiles.length; i++) {
        // Create the image object
        var image = new Image();
 
        image.onload = function () {
            loadcount++;
            if (loadcount == loadtotal) {
                // Done loading
                preloaded = true;
            }
        };
 
        // Set the source url of the image
        image.src = imagefiles[i];
		    image.onerror =  function(){ alert('Some images could not be loaded.'); }; //error handler, just to make sure everything is fine (but preloaded=false is the same thing)
        // Save to the image array
        loadedimages[i] = image;
    }
 
    // Return an array of images
    return loadedimages;
}

function goToMatch(e){
    if(getPageSection() == 1){
        startMatch();
        e.target.innerText = "Go To Profile";
        setPageSection(2);
    }
    else{
        stopMatch();
        e.target.innerText = "Go To Match";
        setPageSection(1);
    }
}