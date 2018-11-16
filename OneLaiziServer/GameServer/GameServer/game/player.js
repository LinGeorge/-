class Player{

    constructor(uid, socket) {
        this.uid = uid;
        this.IsAI = false;
        this.img = 0;
        this.socket = socket;
        this.room = {
            Inroom:false,
            id:null,
            playerIndex: null
        } 
    }

}

module.exports = Player;