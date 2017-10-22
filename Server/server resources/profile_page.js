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
            let tabs = this.deckContainer.querySelectorAll(".deckShowcaseTable");
            tabs.forEach(function(element) {
                element.remove();
            }, this);
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
            td.appendChild(div);
            row.appendChild(td);

            $("#deckCardDiv"+i).draggable({
                zIndex: 100,
                revert: "invalid",
                revertDuration: 350,
                start: this.cardCanvasList[i].onDragStart
            });
        }

        

        this.drawCards();
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