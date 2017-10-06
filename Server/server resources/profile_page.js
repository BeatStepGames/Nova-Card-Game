var profilePage;


function startProfilePage(){
    if(profilePage == undefined){
        profilePage = new ProfilePage();
    }
    
}

class CardCanvas {
    constructor(card){
        this.card = card;
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("class","profileCardCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.printFullCard = this.printFullCard.bind(this);
    }

    printFullCard(){
        if(this.card.img.loaded == false){
            setTimeout(this.printFullCard,50);
        }
        this.card.x = 0;
        this.card.y = 0;
        this.canvas.width = (this.canvas.getBoundingClientRect().width*devicePixelRatio);
        this.canvas.style.height = this.canvas.getBoundingClientRect().width*(3/2);
        this.canvas.height = this.canvas.getBoundingClientRect().height*devicePixelRatio;
        //this.card.height = this.canvas.height;
        this.card.onResize(this.canvas.height/this.card.originalHeight);
        this.card.draw(this.ctx);
        
        //this.canvas.parentElement.parentElement.style.width = this.canvas.getBoundingClientRect().width;
        this.canvas.parentElement.parentElement.style.height = this.canvas.getBoundingClientRect().height;
    }

    getCard(){
        return this.card;
    }

    getCanvas(){
        return this.canvas;
    }
}

class ProfilePage {
    constructor(){
        this.container = document.getElementById("profilePageContainer");
        this.container.style.display = "block";

        this.deckContainer = document.getElementById("deckShowcaseDiv");

        this.deckSelect = document.getElementById("deckSelect");
        this.deckSelect.onchange = function(e){
            this.loadDeck(this.deckSelect.value);
        }.bind(this);
        if(server.open){
            server.register("requestdecksamount",this.populateDeckSelect);
        }
        server.registerOnOpenCallback(function(){
            this.deckNumRequestID = server.register("requestdecksamount",this.populateDeckSelect);
            server.requestDecksAmount();
        }.bind(this));

        this.populateDeckSelect = this.populateDeckSelect.bind(this);
        this.deckCallback = this.deckCallback.bind(this);
        this.cardCallback = this.cardCallback.bind(this);
        this.loadDeck = this.loadDeck.bind(this);
        this.nCardPerRow = 8;
    }

    populateDeckSelect(n){
        if(n>0){
            for(let i=1; i<=n; i++){
                let opt = document.createElement("option");
                opt.innerText = i;
                this.deckSelect.appendChild(opt);
            }
        }
        server.deleteCallback("requestdecksamount",this.deckNumRequestID);
        this.loadDeck(this.deckSelect.value);
    }

    loadDeck(index){
        if(server.open){
            this.deckContainer.innerHTML = "";
            this.cardCanvasList = [];
            this.deckHandlerID = server.register("requestdeck",this.deckCallback);
            this.cardHandlerID = server.register("requestcard",this.cardCallback);
            server.requestDeck(index);
        }
        else{
            server.registerOnOpenCallback(this.loadDeck);
        }
    }

    createRoseter(){
        this.table = document.createElement("table");
        this.table.setAttribute("class","deckShowcaseTable");

        /*
        for(let i=0; i<Math.ceil(this.cardCanvasList.length/this.nCardPerRow); i++){
            let row = document.createElement("tr");
            for(let c=i*this.nCardPerRow; c < (i*this.nCardPerRow)+this.nCardPerRow; c++){
                let td = document.createElement("td");
                let div = document.createElement("div");
                if(this.cardCanvasList[c] == undefined){
                    break;
                }
                div.appendChild(this.cardCanvasList[c].getCanvas());
                td.appendChild(div);
                row.appendChild(td);
            }
            this.table.appendChild(row);
        }
        */

        let row = document.createElement("tr");
        for(let i=0; i<this.cardCanvasList.length; i++){
            let td = document.createElement("td");
            let div = document.createElement("div");
            if(this.cardCanvasList[i] == undefined){
                break;
            }
            div.appendChild(this.cardCanvasList[i].getCanvas());
            td.appendChild(div);
            row.appendChild(td);
        }
        this.table.appendChild(row);

        this.deckContainer.appendChild(this.table);
        this.drawCards()
    }

    drawCards(){
        for(let i=0; i<this.cardCanvasList.length; i++){
            this.cardCanvasList[i].printFullCard();
        }
    }

    deckCallback(data){
        var deck = JSON.parse(data);
        this.numberOfCardToLoad = deck.length;
        for(var i=0; i<deck.length; i++){
            server.requestCard(deck[i]);
        }
        server.deleteCallback("requestdeck",this.deckHandlerID);
    }

    cardCallback(cardData){
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
        this.numberOfCardToLoad -= 1;
        if(this.numberOfCardToLoad <= 0){
            server.deleteCallback("requestcard",this.cardHandlerID);
            this.createRoseter();
        }
    }




}