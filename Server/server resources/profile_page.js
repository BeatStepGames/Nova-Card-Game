var profilePage;


function startProfilePage(){
    if(profilePage == undefined){
        profilePage = new ProfilePage();
    }
    profilePage.refreshInfoPlayer();
    
}

class CardCanvas {
    constructor(card){
        this.card = card;
        this.cardCount = 1;
        this.div = document.createElement("div");
        this.div.style.display = "flex";
        this.div.style.position = "relative";

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("class","profileCardCanvas");

        this.hoverBackground = document.createElement("div");
        this.hoverBackground.classList.add("hoverBackground");
        this.hoverBackground.setAttribute("id","hoverBackground");

        this.hoverText = document.createElement("h1");
        this.hoverText.classList.add("hoverText");
        this.hoverText.setAttribute("id","hoverText");
        this.hoverText.innerText = "";
        
        this.hoverBackground.appendChild(this.hoverText);

        this.hoverCountBubble = document.createElement("div");
        this.hoverCountBubble.classList.add("hoverCountBubble");
        this.hoverCountBubble.innerText = "x1";

        this.div.appendChild(this.canvas);
        this.div.appendChild(this.hoverCountBubble);
        this.div.appendChild(this.hoverBackground);

        this.ctx = this.canvas.getContext("2d");
        this.printFullCard = this.printFullCard.bind(this);
    }

    onDragStart(e){
        console.log(e);
        console.log(this.img);
        console.log(this.canvas);
    }

    onDragEnd(e){
        // this.canvas.style.display = "block";
        // this.img.remove();
    }

    getCardCount(){
        return this.cardCount;
    }

    setCardCount(n){
        this.cardCount = n;
        this.hoverCountBubble.innerText = "x"+n;
    }

    // Convinient method to increment the cardCounter (decrement if n is negative)
    incrementCardCount(n){
        this.setCardCount(this.cardCount+n);
    }

    printFullCard(){
        if(this.card.img.loaded == false){
            setTimeout(this.printFullCard,50);
        }
        this.card.x = 0;
        this.card.y = 0;
        var boundingClientRect = this.canvas.getBoundingClientRect();
        this.canvas.width = (boundingClientRect.width*devicePixelRatio);
        this.canvas.height = this.canvas.width*(3/2);

        this.card.onResize(this.canvas.height/this.card.originalHeight);
        this.card.draw(this.ctx);
        
        this.canvas.style.height = boundingClientRect.width*(3/2);
        //this.canvas.parentElement.parentElement.style.width = this.canvas.getBoundingClientRect().width;
        this.canvas.parentElement.parentElement.style.height = boundingClientRect.height;
    }

    getCard(){
        return this.card;
    }

    getCanvas(){
        return this.canvas;
    }

    getCanvasDim(){
        let d = this.canvas.getBoundingClientRect();
        return d;
    }

    getCanvasDiv(){
        return this.div;
    }
}


class ProfilePage {
    constructor(){
        this.nCardPerRow = 6;
        this.deckAmount = 0;
        setPageSection(1);

        this.deckContainer = document.getElementById("deckShowcaseDiv");
        $("#deckShowcaseDiv").droppable({
            accept: ".ownedCard",
            hoverClass: "droppableZone",
            drop: this.deckSectionDrop.bind(this),
            over: this.deckSectionOver.bind(this),
            out: this.deckSectionOut.bind(this)
          });
        this.cardsOwnedContainer = document.getElementById("cardsOwnedShowcaseDiv");
        $("#cardsOwnedShowcaseDiv").droppable({
            accept: ".deckCard",
            hoverClass: "droppableZone",
            drop: this.ownSectionDrop.bind(this),
            over: this.ownSectionOver.bind(this),
            out: this.ownSectionOut.bind(this)
          });

        this.deleteDeckBtn = document.getElementById("deleteDeckBtn");
        this.deleteDeckBtn.addEventListener("click",function(e){
            if(this.deckSelect.value != "" && this.deckSelect.value != "New"){
                let res = server.deleteDeck(this.deckSelect.value);
                if(res){
                    server.registerOnOpenCallback(function(){
                        this.deckNumRequestID = server.register("requestdecksamount",function(amount){
                            this.deckAmount = amount;
                            this.populateDeckSelect(amount);
                            this.loadDeck(this.deckSelect.value);
                        }.bind(this));
                        server.requestDecksAmount();
                    }.bind(this));
                }
            }
        }.bind(this));

        this.deckSelect = document.getElementById("deckSelect");
        this.deckSelect.onchange = function(e){
            this.loadDeck(this.deckSelect.value);
        }.bind(this);

        server.registerOnOpenCallback(function(){
            this.deckNumRequestID = server.register("requestdecksamount",function(amount){
                this.deckAmount = amount;
                this.populateDeckSelect(amount);
                this.loadDeck(this.deckSelect.value);
                this.loadCardsOwned();
            }.bind(this));
            server.requestDecksAmount();
        }.bind(this));

        this.populateDeckSelect = this.populateDeckSelect.bind(this);
        this.deckCallback = this.deckCallback.bind(this);
        this.deckCardCallback = this.deckCardCallback.bind(this);
        this.cardsOwnedCallback = this.cardsOwnedCallback.bind(this);
        this.singleCardOwnedCallback = this.singleCardOwnedCallback.bind(this);
        this.loadDeck = this.loadDeck.bind(this);
        this.loadCardsOwned = this.loadCardsOwned.bind(this); 
        this.ownSectionDrop = this.ownSectionDrop.bind(this);
        this.deckSectionDrop = this.deckSectionDrop.bind(this);
    }

    refreshInfoPlayer(){
        server.register("requestplayerinfo",this.requestPlayerInfoHandler);
        server.registerOnOpenCallback(server.requestPlayerInfo);
    }

    requestPlayerInfoHandler(message){
        let params = server.splitParams(message);
        document.getElementById("rankInfo").innerText = params[0];
        document.getElementById("matchesInfo").innerText = params[1];
        document.getElementById("moneyInfo").innerText = params[2];
        return true;
    }

    populateDeckSelect(n){
        this.deckSelect.innerHTML = "";
        if(n>0){
            for(let i=1; i<=n; i++){
                let opt = document.createElement("option");
                opt.innerText = i;
                this.deckSelect.appendChild(opt);
            }
        }
        let opt = document.createElement("option");
        opt.innerText = "New";
        this.deckSelect.appendChild(opt);

        server.deleteCallback("requestdecksamount",this.deckNumRequestID);
    }

    // Prototype function to find the index of the first occurence of a card in a CardCanvas array
    findCard(name){
        for(let i = 0; i<this.length; i++){
            if(this[i].card.name == name){
                return i;
            }
        }
        return -1;
    }

    loadDeck(index){
        if(server.open){
            let tabs = this.deckContainer.querySelectorAll(".deckShowcaseTable");
            tabs.forEach(function(element) {
                element.remove();
            }, this);
            // Empty the cardCanvasList to a fresh start
            this.cardCanvasList = [];
            // Add the findCard function the the array
            this.cardCanvasList.findCard = this.findCard.bind(this.cardCanvasList);

            if(index != "New"){
                this.deckHandlerID = server.register("requestdeck",this.deckCallback);
                server.requestDeck(index);
            }
            else{
                this.createDeckRoseter();
            }
        }
        else{
            server.registerOnOpenCallback(function(){
                this.loadDeck(index);
            }.bind(this));
        }
    }

    loadCardsOwned(){
        if(server.open){
            let tabs = this.cardsOwnedContainer.querySelectorAll(".deckShowcaseTable");
            tabs.forEach(function(element) {
                element.remove();
            }, this);
            this.cardsOwnedCanvasList = [];
            this.cardsOwnedCanvasList.findCard = this.findCard.bind(this.cardsOwnedCanvasList);
            this.cardsOwnedHandlerID = server.register("requestcardsowned",this.cardsOwnedCallback);
            server.requestCardsOwned();
        }
        else{
            server.registerOnOpenCallback(function(){
                this.loadCardsOwned();
            }.bind(this));
        }
    }

    deckCallback(data){
        var deck = JSON.parse(data);
        this.numberOfDeckCardsToLoad = deck.length;
        document.getElementById("nCardsDeck").innerText = deck.length;
        this.deckCardHandlerID = server.register("requestcard",this.deckCardCallback);
        for(var i=0; i<deck.length; i++){
            server.requestCard(deck[i]);
        }
        server.deleteCallback("requestdeck",this.deckHandlerID);
    }

    cardsOwnedCallback(data){
        var deck = JSON.parse(data);
        this.numberOfCardsOwnedToLoad = deck.length;
        document.getElementById("nCardsOwned").innerText = `You own ${deck.length} cards`;
        this.singleCardOwnedHandlerID = server.register("requestcard",this.singleCardOwnedCallback);
        for(var i=0; i<deck.length; i++){
            server.requestCard(deck[i]);
        }
        server.deleteCallback("requestcardsowned",this.cardsOwnedHandlerID);
    }

    deckCardCallback(cardData){
        if(cardData != "ERROR 404: Not Found"){
            cardData = JSON.parse(cardData);

            // Find index of this card, if present just increment the card counter
            let cardIndex = this.cardCanvasList.findCard(cardData.name);
            if (cardIndex == -1) {
                this.cardCanvasList.push(new CardCanvas(
                    new Card(
                        0,
                        0,
                        baseDimensions.original_card_height,
                        cardData.name,
                        cardData.level,
                        cardData.comment,
                        cardData.atk,
                        cardData.def,
                        "card_images/" + cardData.name + ".png",
                        1
                    )
                ));
            }
            else{
                this.cardCanvasList[cardIndex].incrementCardCount(1);
            }

        }
        this.numberOfDeckCardsToLoad -= 1;
        if(this.numberOfDeckCardsToLoad <= 0){
            server.deleteCallback("requestcard",this.deckCardHandlerID);
            this.createDeckRoseter();
        }
    }

    singleCardOwnedCallback(cardData){
        if(cardData != "ERROR 404: Not Found"){
            cardData = JSON.parse(cardData);
            
            let cardIndex = this.cardsOwnedCanvasList.findCard(cardData.name);
            if (cardIndex == -1) {
                this.cardsOwnedCanvasList.push(new CardCanvas(
                    new Card(
                        0,
                        0,
                        baseDimensions.original_card_height,
                        cardData.name,
                        cardData.level,
                        cardData.comment,
                        cardData.atk,
                        cardData.def,
                        "card_images/" + cardData.name + ".png",
                        1
                    )
                ));
            }
            else{
                this.cardsOwnedCanvasList[cardIndex].incrementCardCount(1);
            }

        }
        this.numberOfCardsOwnedToLoad-= 1;
        if(this.numberOfCardsOwnedToLoad <= 0){
            server.deleteCallback("requestcard",this.singleCardOwnedHandlerID);
            if(this.numberOfDeckCardsToLoad <= 0){
                this.createCardsOwnedRoseter();
            }
        }
    }


    createDeckRoseter(){
        this.table = document.createElement("table");
        this.table.setAttribute("class","deckShowcaseTable");
        let row = document.createElement("tr");
        this.table.appendChild(row);
        this.deckContainer.appendChild(this.table);

        for(let i=0; i<this.cardCanvasList.length; i++){
            if(this.cardCanvasList[i] == undefined){
                break;
            }
            
            let td = document.createElement("td");
            let canvas = this.cardCanvasList[i].getCanvas();
            canvas.setAttribute("id","deckCardCanvas"+i);
            let div =  this.cardCanvasList[i].getCanvasDiv();
            div.setAttribute("id","deckCardDiv"+i);
            div.classList.add("deckCard");
            td.appendChild(div);
            row.appendChild(td);

            $("#deckCardDiv"+i).draggable({
                zIndex: 100,
                revert: true,
                revertDuration: 350,
                cursor: "pointer",
                start: this.cardCanvasList[i].onDragStart
            });
        }
        this.drawCards(this.cardCanvasList);
        
        this.deckContainer.style.height = this.cardsOwnedContainer.getBoundingClientRect().height;
    }

    createCardsOwnedRoseter(){
        this.table = document.createElement("table");
        this.table.setAttribute("class","deckShowcaseTable");
        let row = document.createElement("tr");
        this.table.appendChild(row);
        this.cardsOwnedContainer.appendChild(this.table);

        for(let i=0; i<this.cardsOwnedCanvasList.length; i++){
            if(this.cardsOwnedCanvasList[i] == undefined){
                break;
            }
            let td = document.createElement("td");
            let canvas = this.cardsOwnedCanvasList[i].getCanvas();
            canvas.setAttribute("id","cardOwnedCanvas"+i);
            let div =  this.cardsOwnedCanvasList[i].getCanvasDiv();
            div.setAttribute("id","cardOwnedDiv"+i);
            div.classList.add("ownedCard");
            td.appendChild(div);
            row.appendChild(td);

            $("#cardOwnedDiv"+i).draggable({
                zIndex: 100,
                revert: true,
                revertDuration: 350,
                cursor: "pointer",
                start: this.cardsOwnedCanvasList[i].onDragStart
            });
        }
        this.drawCards(this.cardsOwnedCanvasList);
        
        this.deckContainer.style.height = this.cardsOwnedContainer.getBoundingClientRect().height;
    }

    drawCards(canvasList){
        for(let i=0; i<canvasList.length; i++){
            canvasList[i].printFullCard();
        }
    }

    // Whene card dropped here, delete it from the deck
    ownSectionDrop(event,ui){
        // Remove the text "Remove from deck"
        let hover = ui.draggable[0].children.hoverBackground;
        hover.children.hoverText.innerText = "";
        $(hover).animate({
            opacity: 0
        }, 200);

        var cardCanvas;
        for(let i=0; i<this.cardCanvasList.length; i++){
            if(this.cardCanvasList[i].getCanvasDiv().id == ui.draggable[0].id){
                cardCanvas = this.cardCanvasList[i];
                break;
            }
        }
        this.removeCardFromDeckHandlerID = server.register("removecardfromdeck",function(message){
            return this.removeCardFromDeckHandler(message,cardCanvas);
        }.bind(this));
        server.removeCardFromDeck(cardCanvas.card.name,this.deckSelect.value);
    }

    // Handles the response from the server to a removeCardFromDeck request
    removeCardFromDeckHandler(message, cardCanvas){
        let params = server.splitParams(message);
        // Check if this response from the server is for this method
        if(params[1] == cardCanvas.card.name){
            // Check if the card was actually removed
            if(params[0] == "YES"){
                // Check if the deck involved is still showing on the screen
                if(params[2] == this.deckSelect.value){
                    // Check if is the last copy of this card in the deck, if not just decrement by one the cardCounter
                    if(cardCanvas.getCardCount() > 1){
                        cardCanvas.incrementCardCount(-1);
                    }
                    else{
                        let toRemove = cardCanvas.getCanvasDiv().parentElement; // This is the <td> of that card
                        toRemove ? toRemove.remove() : undefined; // Removing the card from the page
                        for(let i=0; i<this.cardCanvasList.length; i++){
                            if(this.cardCanvasList[i].getCanvasDiv().id == cardCanvas.getCanvasDiv().id){
                                this.cardCanvasList.splice(i,1);
                                break;
                            }
                        }
                    }

                }
            }
            else{
                let btns = [];
                btns.push(new NotificationButton("Got it"));
                let notif = new FloatingNotification(params[1] + " not removed from deck",btns);
                notif.show();
            }
            return true;
        }
        else{
            return false;
        }
    }

    ownSectionOver(event, ui) {
        let hover = ui.draggable[0].children.hoverBackground;
        hover.children.hoverText.innerText = "Remove from deck";
        $(hover).animate({
            opacity: 1
        }, 200);
    }

    ownSectionOut(event, ui) {
        let hover = ui.draggable[0].children.hoverBackground;
        hover.children.hoverText.innerText = "";
        $(hover).animate({
            opacity: 0
        }, 200);
    }

    // When card dropped here, add it to the deck
    deckSectionDrop(event, ui) {
        // Remove the text "Add to deck"
        let hover = ui.draggable[0].children.hoverBackground;
        hover.children.hoverText.innerText = "";
        $(hover).animate({
            opacity: 0
        }, 200);

        var cardCanvas;
        for(let i=0; i<this.cardsOwnedCanvasList.length; i++){
            if(this.cardsOwnedCanvasList[i].getCanvasDiv().id == ui.draggable[0].id){
                cardCanvas = new CardCanvas(this.cardsOwnedCanvasList[i].card);
                break;
            }
        }
        this.addCardToDeckHandlerID = server.register("addcardtodeck",function(message){
            return this.addCardToDeckHandler(message,cardCanvas);
        }.bind(this));
        server.addCardToDeck(cardCanvas.card.name,this.deckSelect.value);
    }

    // Handles response from server to the add card to deck request
    addCardToDeckHandler(message,cardCanvas){
        let params = server.splitParams(message);
        // Check if this response from the server is for this method
        if(params[1] == cardCanvas.card.name){
            // Check if the card was actually added
            if(params[0] == "YES"){
                // Check the deck involved is still showing
                if(params[2] == this.deckSelect.value){
                    // First we check if there is already a copy of this card in the deck, if no create the cardCanvas, else just increment the cardCounter
                    let cardIndex = this.cardCanvasList.findCard(params[1]);
                    if(cardIndex == -1){
                        let row = document.querySelector(".deckShowcaseTable tr");
                        this.addCardCanvasToRow(cardCanvas, this.cardCanvasList.length, row, this.cardCanvasList);
                        cardCanvas.printFullCard();
                    }
                    else{
                        this.cardCanvasList[cardIndex].incrementCardCount(1);
                    }

                }
                // this.deckAmount < params[2] è usato perchè se una richiesta successiva viene ricevuta prima di una fatta precedentemente,
                // per esempio "add card in new deck 5" è ricevuta prima di "add card in new deck 4", dato l'ordinamento con cui vengono creati i deck,
                // sapendo che ci è arrivato il quinto deck, il quarto è stato già creato ma ci siamo persi il messaggio che ce lo diceva.
                // Quindi quando poi arriva il messaggio della creazione del 4 deck, noi già lo sapevamo che era stato creato, e anche che
                // l'utente ormai ha selezionato un nuovo deck, quindi non dobbiamo aggiornare l'interfaccia
                if(params[3] == "new" && this.deckAmount < params[2] && this.deckSelect.value == "New"){
                    this.deckAmount = params[2];
                    this.populateDeckSelect(this.deckAmount); // Ripopulate the <select>, this wil select deck 1
                    this.deckSelect.selectedIndex = params[2]-1; // Change from the first index to the right one

                    let row = document.querySelector(".deckShowcaseTable tr");
                    this.addCardCanvasToRow(cardCanvas, this.cardCanvasList.length, row, this.cardCanvasList);
                    cardCanvas.printFullCard();
                }

            }
            else{
                let btns = [];
                btns.push(new NotificationButton("Got it"));
                let notif = new FloatingNotification(params[1] + " not added to deck: " + params[3],btns);
                notif.show();
            }
            return true;
        }
        else{
            return false;
        }
    }

    // helper function to add a card to the deck table
    // a row is a <tr> object, list is the the cardCanvas will be added to, index is the index it will be added at in the list
    addCardCanvasToRow(cardCanvas, index, row, list){
        let td = document.createElement("td");
        let canvas = cardCanvas.getCanvas();
        canvas.setAttribute("id","deckCardCanvas"+index);
        let div =  cardCanvas.getCanvasDiv();
        div.setAttribute("id","deckCardDiv"+index);
        div.classList.add("deckCard");
        td.appendChild(div);

        row.appendChild(td);

        $(cardCanvas.getCanvasDiv()).draggable({
            zIndex: 100,
            revert: true,
            revertDuration: 350,
            cursor: "pointer",
            start: cardCanvas.onDragStart
        });

        if(list) list.push(cardCanvas);
    }
    

    deckSectionOver(event, ui) {
        let hover = ui.draggable[0].children.hoverBackground;
        hover.children.hoverText.innerText = "Add to deck";
        $(hover).animate({
            opacity: 1
        }, 200);
    }

    deckSectionOut(event, ui) {
        let hover = ui.draggable[0].children.hoverBackground;
        hover.children.hoverText.innerText = "";
        $(hover).animate({
            opacity: 0
        }, 200);
    }


    onResize(){
        this.drawCards(this.cardCanvasList);
        this.drawCards(this.cardsOwnedCanvasList);
        this.deckContainer.style.height = this.cardsOwnedContainer.getBoundingClientRect().height;
    }

}