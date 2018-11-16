
var Socket = require("socket.io");
var global = require("./global");
var Room = require('./room');
var Player = require('./player');

const SocketServer = function (server) {

    var io = Socket(server);
    var roomList = [new Room(0)]; //已創立的房間,預設為１間

    // 當玩家連進伺服器時
    io.on("connection", function (socket) {

        try {           

            console.log("A user connection ( Socket.id: %s )", socket.id); //輸出客戶端的socketid

            // 玩家login事件,參數uid
            socket.on('login', function (uid,Success) {
               
                //------------------------------------------------------檢查ID是否被使用過    
                
                if (global.players.hasOwnProperty(uid) === true) {
                                        
                    if (global.players[uid].socket.disconnected === true) {

                        Success(true);
                        global.players[uid].IsAI = false;
                        global.players[uid].socket = socket;
                        
                    } else {
                        Success(false); //id已使用過,回傳訊息給client,並結束事件
                    }

                }
                else {
                    Success(true);
                    var PlayerInfo = new Player(uid, socket);
                    PlayerInfo.img = (Object.keys(global.players).length) % 4;
                    global.players[uid] = PlayerInfo;
                    availableRoom().AddPlayer(uid);
                    
                }               
           

            });

            socket.on('AIswitch', function (uid,callback) {

                if (global.players[uid].IsAI == true) {
                    global.players[uid].IsAI = false;
                    callback(false);
                }
                else {
                    global.players[uid].IsAI = true;
                    callback(true);
                }
               
            }),

            socket.on('InRoom', function (uid,callback) {

                if (global.players[uid].room.Inroom == true) {
                    roomList[global.players[uid].room.id].RemovePlayer(uid);
                }
                availableRoom().AddPlayer(uid);
                callback(true);
            });          

            socket.on('LoadGame', function (uid) {
                roomList[global.players[uid].room.id].LoadGame(uid);
            });

            //當有socket中斷連線時檢查每個room的player中誰disconnect=true;
            socket.on('disconnect', function () {

                for (var playName in global.players) {

                    if (global.players[playName].socket.disconnected == true) {

                        if (global.players[playName].room.Inroom == true) {
                            console.log(playName + ' logout from room ' + global.players[playName].room.id);
                            roomList[global.players[playName].room.id].RemovePlayer(playName); //將玩家移出房間                        
                        } else {
                            delete global.players[playName]; //家玩家資訊從伺服器清除
                        }

                    }
                }

             
            });

            socket.on('EndMyturn', function (uid) {
                roomList[global.players[uid].room.id].skipthisTurn();
            });


            socket.on('SubmitCards', function (uid, cards) {
                roomList[global.players[uid].room.id].GetCards(cards);
            });

            socket.on('ChoseDizhu', function (uid, factor) {
                roomList[global.players[uid].room.id].callDizhu(factor);
            });

            socket.on('CallDouble', function (uid, factor) {
                roomList[global.players[uid].room.id].callDouble(uid, factor);
            });


        }
        catch (e) {
            console.log(e);
        }
       

    });   


    function availableRoom() {
        for (var index = 0; index < roomList.length; index++) {
            if (roomList[index].Avaiable() == true) {
                return roomList[index];
            }
            if (index == roomList.length - 1) //查到最後一房都是滿的就新開一房
            {
                roomList.push(new Room(roomList.length));
                return roomList[roomList.length - 1];                
            }
        }
    }

    return io;
}

module.exports = SocketServer;
