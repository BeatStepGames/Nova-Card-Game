var profilePage;


function startProfilePage(){
    if(profilePage == undefined){
        profilePage = new ProfilePage();
    }
    
}

class CardCanvas {
    constructor(card){
        this.card = card;        
        this.div = document.createElement("div");
        this.div.setAttribute("class","draggable");

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("class","profileCardCanvas");

        this.div.appendChild(this.canvas);

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

    printFullCard(){
        if(this.card.img.loaded == false){
            setTimeout(this.printFullCard,50);
        }
        this.card.x = 0;
        this.card.y = 0;
        this.canvas.width = (this.canvas.getBoundingClientRect().width*devicePixelRatio);
        this.canvas.height = this.canvas.width*(3/2);

        this.card.onResize(this.canvas.height/this.card.originalHeight);
        this.card.draw(this.ctx);
        
        this.canvas.style.height = this.canvas.getBoundingClientRect().width*(3/2);
        //this.canvas.parentElement.parentElement.style.width = this.canvas.getBoundingClientRect().width;
        this.canvas.parentElement.parentElement.style.height = this.canvas.getBoundingClientRect().height;
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
        setPageSection(1);

        this.deckContainer = document.getElementById("deckShowcaseDiv");
        $("#deckShowcaseDiv").droppable({
            accept: ".ownedCard",
            hoverClass: "droppableZone",
            drop: this.deckSectionDrop.bind(this)
          });
        this.cardsOwnedContainer = document.getElementById("cardsOwnedShowcaseDiv");
        $("#cardsOwnedShowcaseDiv").droppable({
            accept: ".deckCard",
            hoverClass: "droppableZone",
            drop: this.ownSectionDrop.bind(this)
          });

        this.deleteDeckBtn = document.getElementById("deleteDeckBtn");

        this.deckSelect = document.getElementById("deckSelect");
        this.deckSelect.onchange = function(e){
            this.loadDeck(this.deckSelect.value);
        }.bind(this);

        server.registerOnOpenCallback(function(){
            this.deckNumRequestID = server.register("requestdecksamount",function(amount){
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

        this.deleteDeckBtn.addEventListener("click",function(e){
            if(this.deckSelect.value != "New"){
                let res = server.deleteDeck(this.deckSelect.value);
                if(res){
                    server.registerOnOpenCallback(function(){
                        this.deckNumRequestID = server.register("requestdecksamount",function(amount){
                            this.populateDeckSelect(amount);
                            this.loadDeck(this.deckSelect.value);
                        }.bind(this));
                        server.requestDecksAmount();
                    }.bind(this));
                }
            }
        }.bind(this));
    }

    loadDeck(index){
        if(server.open){
            let tabs = this.deckContainer.querySelectorAll(".deckShowcaseTable");
            tabs.forEach(function(element) {
                element.remove();
            }, this);
            this.cardCanvasList = [];
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
        this.deckCardHandlerID = server.register("requestcard",this.deckCardCallback);
        for(var i=0; i<deck.length; i++){
            server.requestCard(deck[i]);
        }
        server.deleteCallback("requestdeck",this.deckHandlerID);
    }

    cardsOwnedCallback(data){
        var deck = JSON.parse(data);
        this.numberOfCardsOwnedToLoad = deck.length;
        this.singleCardOwnedHandlerID = server.register("requestcard",this.singleCardOwnedCallback);
        for(var i=0; i<deck.length; i++){
            server.requestCard(deck[i]);
        }
        server.deleteCallback("requestcardsowned",this.cardsOwnedHandlerID);
    }

    deckCardCallback(cardData){
        if(cardData != "ERROR 404: Not Found"){
            cardData = JSON.parse(cardData);
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
                    "card_images/"+cardData.name+".png",
                    1
                )
            ));
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
                    "card_images/"+cardData.name+".png",
                    1
                )
            ));
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
            let td = document.createElement("td");
            if(this.cardCanvasList[i] == undefined){
                break;
            }
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
        //DEBUG
        this.deckContainer.style.height = this.cardsOwnedContainer.getBoundingClientRect().height;
        //End DEBUG
    }

    createCardsOwnedRoseter(){
        this.table = document.createElement("table");
        this.table.setAttribute("class","deckShowcaseTable");
        let row = document.createElement("tr");
        this.table.appendChild(row);
        this.cardsOwnedContainer.appendChild(this.table);

        for(let i=0; i<this.cardsOwnedCanvasList.length; i++){
            let td = document.createElement("td");
            if(this.cardsOwnedCanvasList[i] == undefined){
                break;
            }
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
        //DEBUG
        this.deckContainer.style.height = this.cardsOwnedContainer.getBoundingClientRect().height;
        //End DEBUG
    }

    drawCards(canvasList){
        for(let i=0; i<canvasList.length; i++){
            canvasList[i].printFullCard();
        }
    }

    // Whene card dropped here, delete it from the deck
    ownSectionDrop(event,ui){
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

    removeCardFromDeckHandler(message, cardCanvas){
        let params = server.splitParams(message);
        if(params[1] == cardCanvas.card.name){
            if(params[0] == "YES"){
                if(params[2] == this.deckSelect.value){
                    let toRemove = cardCanvas.getCanvasDiv().parentElement;
                    toRemove ? toRemove.remove() : undefined;
                    let index = cardCanvas.getCanvasDiv().id.substr("deckCardDiv".length);
                    for(let i=0; i<this.cardCanvasList.length; i++){
                        if(this.cardCanvasList[i].getCanvasDiv().id == cardCanvas.getCanvasDiv().id){
                            this.cardCanvasList.splice(i,1);
                            break;
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

    // When card dropped here, add it to the deck
    deckSectionDrop(event,ui){

    }


    onResize(){
        this.drawCards(this.cardCanvasList);
        this.drawCards(this.cardsOwnedCanvasList);
    }

}