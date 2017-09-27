function Lobby(){
    this.player1;
    this.player2;
    const STATES = {
        empty:0,
        waitingP2:1,
        InGame:2,
        Closing:3
    };
    this.state = STATES.empty;




}