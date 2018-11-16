const Player = require('./player');
const dataManager = require('./dataManager');
const DoDizhuRule = require('./DoDizhuRule');
const findtype = require('./findtype');
const CardUtil = require('./partCards/CardUtil');
var global = require('./global');
const countDownSecond = 15;
const Initialpoint = 25;
const BASE_ODDS = 2;

var GameStep = Object.freeze({
    "Waiting": 0, "GameStart": 1, "callDizhu": 2, "RaiseDizhu": 3
    , "PersonalDouble": 4, "Playing": 5,"choseLaiziCard":6 ,"Result": 7
});

var AnimationDelay = Object.freeze({
    "None": 0, "GameStart": 2170, "AddDizhuCard": 0, "PASScard": 300,
    "straigth": 830, "Spring": 2080, "reverseSpring": 2080, "airplane": 2000, "bomb": 1750, "laizi": 1500, "rocket": 2920
});

class Room {

    constructor(index) {



        //房間資訊
        this.room = {
            id: index,
            players: [null, null, null] //以玩家名稱作為紀錄

        }

        //開始遊戲資訊
        this.game = {

            //倒數計時器資訊
            timer: {

                stage: GameStep.Waiting,
                countdown: countDownSecond, //目前玩家剩下時間
                whosTurn: 0, //目前輪到哪個玩家
                timer: null, //儲存setInterval Object 用於停止倒數

            },

            //遊戲階段個玩家牌型
            CardsConfig: { //各個玩家得牌
                dizhuIndex: -1,
                who: 0,//目前最大牌是誰出的                
                current: [[], [], []],//目前牌型
                cards: [[], [], []],  //3個玩家的手牌       
                Dizhu: [],   //地主牌
                submitCardTimes: [0, 0, 0] //紀錄玩家出了幾手牌(春天/返春)
            },

            //
            result: {
                //底分
                point: Initialpoint,
                //賠率:含飛機,炸彈,春天...
                Odds: -1,
                //紀錄搶地主階段每個玩家的叫分,-1表示未叫分,0:不要,1:1分,2:2分,3:3分
                playerChosenOdds: [-1, -1, -1],
                //紀錄
                log: {
                    bomb: 1,
                    rocket: 1,
                    RSpring: 1,
                },
                //個人賠率:地主明牌,農民加倍
                personalOdds: [-1, -1, -1],
            }
        },

        this.Laizi = {
            origionCards: [],
            Possibles: [],            
        }
    }


    //重設遊戲遊戲計數器
    ResetTimer() {

        var game = this.game;

        game.timer.stage = GameStep.Waiting;
        this.game.timer.whosTurn = Math.round(Math.random() * 10) % 3;
        game.timer.countdown = countDownSecond;

        if (game.timer.timer != null)
            clearInterval(this.game.timer.timer);
        game.timer.timer = null;



    };

    //清除上一局牌面
    ResetGame() {
        
        var game = this.game;

        game.CardsConfig.dizhuIndex = -1;
        game.CardsConfig.who = this.game.timer.whosTurn;
        game.CardsConfig.current = [[], [], []];
        game.CardsConfig.cards = [[], [], []];
        game.CardsConfig.Dizhu = [];
        game.CardsConfig.submitCardTimes = [0, 0, 0];



        game.result.point = Initialpoint;
        game.result.Odds = -1;
        game.result.playerChosenOdds = [-1, -1, -1];
        game.result.log = {
            bomb: 1,
            rocket: 1,
            RSpring: 1,
        };
        game.result.personalOdds = [-1, -1, -1];

    };

    //中斷連線的玩家連回
    LoadGame(uid) {

        global.players[uid].socket
            .emit('SwitchScene', 1)
            .emit('roomInfo', dataManager.room(this, global.players[uid].room.playerIndex))
            .emit('playerInfo', dataManager.player(this.room, global.players[uid].room.playerIndex + 3))
            .emit('timer', dataManager.timer(this.game, global.players[uid].room.playerIndex + 3, false))
            .emit('GetCards', dataManager.cards(this.game, global.players[uid].room.playerIndex + 3));

        if (this.game.timer.stage == GameStep.Result) {
            this.showGameResult();
        }
        
    }

    //玩家是否可加入房間
    Avaiable() {

        if (this.game.timer.stage != GameStep.Waiting)
            return false;
        for (var i = 0; i < 3; i++) {
            if (this.room.players[i] == null) {
                return true;
            }
        }
        return false;
    }

    //房間內新增玩家
    AddPlayer(uid) {

        for (var i = 0; i < 3; i++) {
            if (this.room.players[i] == null) {
                this.room.players[i] = uid;
                global.players[uid].room.playerIndex = i;
                break;
            }
        }

        global.players[uid].room.id = this.room.id;
        global.players[uid].room.Inroom = true;
        console.log(uid, ' is in room ', global.players[uid].room.id);

        var self = this;
        //當玩家滿3人自動開始
        if ((this.room.players[0] != null) && (this.room.players[1] != null) && (this.room.players[2] != null)) {
                self.Gamestart();
           
        }

        self.UpdateRoomInfo();
        self.UpdatePlayerInfo();
        self.Updatetimer();

       
    };

    //移除房間的玩家
    RemovePlayer(uid) {


     
        if (this.game.timer.stage == GameStep.Result) {
            this.room.players[global.players[uid].room.playerIndex] = null;
            global.players[uid].room.Inroom = false;
    
        } else if (this.game.timer.stage != GameStep.Waiting) {
            global.players[uid].IsAI = true; 
        }
        else {
            this.room.players[global.players[uid].room.playerIndex] = null;
           
            global.players[uid].room.Inroom = false;
            this.UpdatePlayerInfo();
        }

        var self = this;
        if ((this.room.players[0] == null) && (this.room.players[1] == null) && (this.room.players[2] == null)) {
            setTimeout(function () {
                self.GameStop();
            },500);
        }

    };

    //更新房間的資訊
    UpdateRoomInfo() {
        for (var i = 0; i < 3; i++) {
            if (this.room.players[i] != null) {
                //傳資料給個player的sokcet
                global.players[this.room.players[i]].socket.emit('roomInfo', dataManager.room(this));
            }
        }

    }

    //更新玩家資訊
    UpdatePlayerInfo() {
        for (var i = 1; i < 4; i++) {
            if (this.room.players[i % 3] != null) {
                //傳資料給個player的sokcet
                global.players[this.room.players[i % 3]].socket.emit('playerInfo', dataManager.player(this.room, i));
            }
        }
    }

    //向client端傳送倒數計時的資料
    Updatetimer(cleanUp = false) {
        for (var i = 0; i < 3; i++) {
            if (this.room.players[i] != null) {
                //傳資料給個player的sokcet
                global.players[this.room.players[i]].socket.emit('timer', dataManager.timer(this.game, i, cleanUp));
            }
        }

    }

    //更新牌組的資訊
    UpdateCardsInfo(cards) {

        for (var i = 1; i < 4; i++) {
            if (this.room.players[i % 3] != null) {
                //傳資料給個player的sokcet
                global.players[this.room.players[i % 3]].socket.emit('GetCards', cards(this.game, i));
            }
        }

    }

    //跳過這個回合
    skipthisTurn() {


        if ((this.game.timer.stage == GameStep.choseLaiziCard)) {

            if (this.Laizi.Possibles != null) {
                this.GetCards(0);
                return
            }
            this.game.timer.stage = GameStep.Playing;
            
        }
        //加倍階段大家都加倍了就跳過
        else if (this.game.timer.stage == GameStep.PersonalDouble) {
            for (var i = 0; i < 3; i++) {
                if (this.game.result.personalOdds[i] == -1) {
                    this.callDouble(global.players[this.room.players[i]].uid, 1);
                }
            }
            return;
        }
        //叫分階段要切換到下一個玩家前的自動不叫        
        else if ((this.game.result.playerChosenOdds[this.game.timer.whosTurn] == -1) && (JSON.stringify(this.game.CardsConfig.current[this.game.timer.whosTurn]) == JSON.stringify([]))) {
            if (this.game.timer.stage == GameStep.callDizhu)
                this.callDizhu("notCall");
            else if (this.game.timer.stage == GameStep.RaiseDizhu)
                this.callDizhu("notRaise");

            return;
        }
        //出牌階段要切換到下一個玩家前的自動出牌       
        else if ((this.game.timer.stage == GameStep.Playing) && (JSON.stringify(this.game.CardsConfig.current[this.game.timer.whosTurn]) == JSON.stringify([]))) {

            var AutoChoseCard = DoDizhuRule.AutoSubmitCard(
                this.game.CardsConfig.current[this.game.CardsConfig.who],
                this.game.CardsConfig.cards[this.game.timer.whosTurn],
                this.game.timer.whosTurn == this.game.CardsConfig.who);


            this.GetCards(AutoChoseCard);

            if (AutoChoseCard != "PASS")
                return;
        }
        //自動退出遊戲
        else if (this.game.timer.stage == GameStep.Result) {
            var self = this;

            this.room.players.forEach(function (playerindex, index) {

                var player = global.players[playerindex]

                if (player == null) return;

                if (player.room.id == self.room.id) {
                    player.Inroom = false;
                    player.socket.emit("SwitchScene", 0);
                    delete global.players[playerindex];
                }

                self.room.players[index] = null;

            });
            self.GameStop();
        }

        //輪到下一個玩家
        this.game.timer.whosTurn++;
        if (this.game.timer.whosTurn > 2) this.game.timer.whosTurn = 0;
        this.game.timer.countdown = countDownSecond;
        this.game.CardsConfig.current[this.game.timer.whosTurn] = [];

        //更新user端資訊
        this.Updatetimer();
        this.UpdateCardsInfo(dataManager.cards);

        //假如PASS一圈回到自己可以出任意牌
        if (this.game.timer.whosTurn == this.game.CardsConfig.who) {
            var self = this;
            //當大家都PASS時不會立即清除牌面，以防未顯示最後一個人的PASS
            self.WaitForAnimations("None", AnimationDelay.PASScard, function () {
                self.game.CardsConfig.current = [[], [], []];
                self.UpdateCardsInfo(dataManager.cards);
            });
        }
    }

    //開始遊戲
    Gamestart() {
        var self = this;
        var GamingObj = this.game;
        var Gamingtimer = this.game.timer;

        //當遊戲一開始時初始化出牌起頭人,跟倒數的秒數

        if (Gamingtimer.stage == GameStep.Waiting) {
            DoDizhuRule.ConfigCard(self.game.CardsConfig); //發牌
            self.UpdateRoomInfo();
            self.game.timer.stage++;
            self.WaitForAnimations("gameStart", AnimationDelay.GameStart, function () {
                self.UpdateCardsInfo(dataManager.cards);//把牌面傳給client
                self.game.timer.stage++;
                self.UpdateRoomInfo();
            });

        }

        self.Updatetimer(); //更新client的timer資訊

        if (Gamingtimer.timer != null)
            clearInterval(Gamingtimer.timer);

        Gamingtimer.timer = setInterval(function () { //將interval儲存,用於停止interval

            Gamingtimer.countdown--;  //開始倒數計時


            //託管自動出牌

            if (global.players[self.room.players[self.game.timer.whosTurn]] != null) {
                if (self.game.timer.stage == GameStep.PersonalDouble) {
                    
                    if (global.players[self.room.players[0]].IsAI) {
                        self.callDouble(global.players[self.room.players[0]].uid, 1);                        
                    }
                    if (global.players[self.room.players[1]].IsAI) {
                        self.callDouble(global.players[self.room.players[1]].uid, 1);
                    }
                    if (global.players[self.room.players[2]].IsAI) {
                        self.callDouble(global.players[self.room.players[2]].uid, 1);                      
                    }
                    
                }
                else if (global.players[self.room.players[self.game.timer.whosTurn]].IsAI) {
                    if (self.game.timer.stage == GameStep.callDizhu) {
                        var point = Math.round(Math.random() * 10) % 2;
                        if (point == 0)
                            self.callDizhu("call");
                        else
                            self.callDizhu("notCall");
                    }
                    else if (self.game.timer.stage == GameStep.RaiseDizhu) {
                        var point = Math.round(Math.random() * 10) % 2;

                        if (point == 0)
                            self.callDizhu("Raise");
                        else
                            self.callDizhu("notRaise");
                    }
                    else if (self.game.timer.stage == GameStep.Playing) {
                        var HintCards = findtype.GetAllType(self.game.CardsConfig.cards[self.game.timer.whosTurn], self.game.CardsConfig.current[self.game.CardsConfig.who]);

                        if ((typeof (HintCards) == "undefined") || (HintCards.length == 0))
                            self.skipthisTurn();
                        else {

                            var longest = HintCards[0];
                            for (var i = 1; i < HintCards.length; i++) {
                                if (typeof (HintCards[i]) == "undefined") break;
                                if (HintCards[i].length > longest.length) {
                                    longest = HintCards[i];
                                }
                            }
                            self.GetCards(longest);
                        }
                    }
                    else if (self.game.timer.stage == GameStep.choseLaiziCard) {
                        if (self.Laizi.Possibles != null) {
                            self.GetCards(0);
                        }
                    }
                 
                }
            }



            if (Gamingtimer.countdown == 0) {   //當數道零換下一位玩家
                self.skipthisTurn()
                return;
            }

            self.Updatetimer(); //更新client的timer資訊

        }, 1000); //每1000ms觸發一次

    }

    //清除timer,game資訊
    GameStop(update = true) {
        this.ResetTimer();
        this.ResetGame();

        if (update) {
            this.Updatetimer();
            this.UpdateCardsInfo(dataManager.clearCards);
            this.UpdateRoomInfo();
        }
    }

    //暫停等待某秒數後做func:After
    WaitForAnimations(Animation, delaySecond, After) {

        var self = this;
        this.GamePause();


        for (var i = 0; i < 3; i++) {
            if (this.room.players[i] != null) {
                //傳資料給個player的sokcet

                //順子特效在每個人的位置，其餘特效都在場中央
                if (Animation == "straight") {
                    switch (self.game.timer.whosTurn - i) {
                        case 1:
                        case -2:
                            global.players[this.room.players[i]].socket.emit('Animation', Animation, "Next");
                            break;
                        case 0:
                            global.players[this.room.players[i]].socket.emit('Animation', Animation, "Me");
                            break;
                        case -1:
                        case 2:
                            global.players[this.room.players[i]].socket.emit('Animation', Animation, "Pre");
                            break;
                    }
                }
                else {
                    global.players[this.room.players[i]].socket.emit('Animation', Animation, "Me");
                }

            }
        }

        //表演完接著做的function
        setTimeout(function () {

            if (typeof (After) != "undefined") {
                After();
            }
            self.Gamestart();

        }, delaySecond, After);
    }

    //清除timer但不重設目前計數資料
    GamePause() {
        clearInterval(this.game.timer.timer);
        this.Updatetimer(true);
    }

    //取得這回合出牌           
    GetCards(cards) {

        var self = this;
        var legal = false;
        //回傳是文字狀態
        if (typeof (cards) == "string") {
            this.game.CardsConfig.current[this.game.timer.whosTurn] = cards;
        }
        else {

            if ((self.game.timer.stage == GameStep.Playing) && DoDizhuRule.hasLaiziCards(cards)) {

                //存入原本的牌型
                self.Laizi.origionCards = cards;
                self.Laizi.Possibles = DoDizhuRule.GetTwoPossibleCardType(cards);
                
                for (var i = 0; i < self.Laizi.Possibles.length; i++) {
                    if (DoDizhuRule.Islegal(this.game.CardsConfig.current[this.game.CardsConfig.who], self.Laizi.Possibles[i]) == true) {
                        legal = true;
                        break;
                    }
                }

                if (legal == false) {
                    global.players[this.room.players[this.game.timer.whosTurn]].socket.emit("Animation", 'illegal', "Me");
                    return;
                }

                self.game.timer.stage = GameStep.choseLaiziCard;
                self.Updatetimer();              

                global.players[self.room.players[self.game.timer.whosTurn]].socket.emit("ShowLaiziPossibleTypes", self.Laizi.Possibles);
                return;
            }

            
            //玩家所選參數換成真的牌型
            if (self.game.timer.stage == GameStep.choseLaiziCard) {
                cards = self.Laizi.Possibles[cards];
                self.Updatetimer();
            }


            //判斷是否為可以出的牌型
            legal = DoDizhuRule.Islegal(this.game.CardsConfig.current[this.game.CardsConfig.who], cards);
                          

            //可出牌
            if (legal) {

                this.game.CardsConfig.who = this.game.timer.whosTurn;
                this.game.CardsConfig.current[this.game.timer.whosTurn] = cards;
                this.game.CardsConfig.submitCardTimes[this.game.timer.whosTurn]++;
                
                //是否為炸彈/飛機/順子... 紀錄倍率跟執行動畫
                var cardAnimation = "None";
                var cardAnimationDelay = AnimationDelay.None;
                switch (DoDizhuRule.CardType(cards)) {
                    case 12:
                        cardAnimation = "rocket";
                        cardAnimationDelay = AnimationDelay.rocket;
                        this.game.result.log.rocket *= 2;
                        this.game.result.Odds *= 2;
                        this.UpdateRoomInfo();
                        break;
                    case 6:
                        cardAnimation = "straight";
                        cardAnimationDelay = AnimationDelay.straigth;
                        break;
                    case 11:
                        cardAnimation = "bomb";
                        cardAnimationDelay = AnimationDelay.bomb;
                        this.game.result.log.bomb *= 2;
                        this.game.result.Odds *= 2;
                        this.UpdateRoomInfo();
                        break;

                }

                //清除癩子牌原本的樣子
                if (self.game.timer.stage == GameStep.choseLaiziCard) {
                    cards = self.Laizi.origionCards.slice(0, 20);
                    self.Laizi.Possibles = null;
                }
                self.RemoveCardsFromDeck(self.game.CardsConfig.cards[self.game.timer.whosTurn], cards)


                self.UpdateCardsInfo(dataManager.cards);
                this.WaitForAnimations(cardAnimation, cardAnimationDelay, function () {

                    //判斷是否結束遊戲
                    if (self.game.CardsConfig.cards[self.game.timer.whosTurn].length == 0) {
                       
                        //地主贏嗎
                        var DizhuWin = (JSON.stringify(self.game.timer.whosTurn) == JSON.stringify(self.game.CardsConfig.dizhuIndex));

                        //判定春天或返春
                        if (DizhuWin) {

                            //春天:農民一張牌未出

                            var SubmitCardstimesEqZero = 0;
                            for (var i = 0; i < 3; i++) {
                                if (self.game.CardsConfig.submitCardTimes[i] == 0)
                                    SubmitCardstimesEqZero++;
                            }

                            if (SubmitCardstimesEqZero == 2) {
                                self.game.result.Odds *= 3;
                                self.game.result.log.RSpring *= 3;;
                                self.WaitForAnimations("spring", AnimationDelay.Spring, function () {
                                    self.showGameResult();
                                });
                            } else {
                                self.WaitForAnimations("None", AnimationDelay.PASScard, function () {
                                    self.showGameResult();
                                });
                            }
                        }
                        else {
                            //反春:地主只出第一手牌
                            if (self.game.CardsConfig.submitCardTimes[self.game.CardsConfig.dizhuIndex] == 1) {
                                self.game.result.Odds *= 3;
                                self.game.result.log.RSpring *= 3;
                                self.WaitForAnimations("Rspring", AnimationDelay.reverseSpring, function () {
                                    self.showGameResult();
                                });
                            }
                            else {
                                self.WaitForAnimations("None", AnimationDelay.PASScard, function () {
                                    self.showGameResult();
                                });
                            }
                        }
                    }
                    self.skipthisTurn();
                });


            }
            else {
                global.players[this.room.players[this.game.timer.whosTurn]].socket.emit("Animation", 'illegal', "Me");
            }
        }
    }

    //農民/地主加倍
    callDouble(playerid, factor) {

        //依名字找出對應的player Socket
        var playerIndex = 0;
        for (playerIndex = 0; playerIndex < 3; playerIndex++)
            if (global.players[this.room.players[playerIndex]].uid == playerid) break;

        //設定結算倍率
        this.game.result.personalOdds[playerIndex] = factor;
        this.game.timer.whosTurn = playerIndex;

        //根據玩家是地主或農民顯示動畫
        if (factor == 2) {
            this.GetCards("Double");
            this.UpdateCardsInfo(dataManager.cards);
            this.Updatetimer();
            global.players[this.room.players[playerIndex]].socket.emit("Animation", playerIndex == this.game.CardsConfig.dizhuIndex ? "dizhuDouble" : "farmerDouble", "Me");

        }
        else if (factor == 1) {
            this.GetCards("notDouble");
            this.Updatetimer();
            this.UpdateCardsInfo(dataManager.cards);
        }

        //檢查是否都叫過了
        var allCall = true;
        for (var i = 0; i < 3; i++) {
            if (this.game.result.personalOdds[i] == -1) {
                allCall = false;
            }
        }

        if (allCall) {
            this.game.timer.stage++;
            this.game.timer.countdown = countDownSecond;
            this.game.timer.whosTurn = this.game.CardsConfig.dizhuIndex;
            this.game.CardsConfig.who = this.game.CardsConfig.dizhuIndex;

            this.game.CardsConfig.current = [[], [], []];

            var self = this;
            this.WaitForAnimations("AddDizhuCard", 500, function () {
                self.UpdateCardsInfo(dataManager.cards);

            });
        }

    }

    //遊戲結算
    showGameResult() {

        var self = this;
                
        var DizhuWin = (JSON.stringify(self.game.CardsConfig.dizhuIndex) == JSON.stringify(self.game.CardsConfig.who));
        self.game.timer.stage = GameStep.Result;
        self.Updatetimer();

        self.room.players.forEach(function (playerindex, index) {

            global.players[playerindex].socket.emit("ResultMessage", {
                whoWin:(DizhuWin == true) ? "dizhuWin" : "farmerWin",
                odds: {
                    dizhu: "地主 x " + self.game.result.log.dizhu * (index == self.game.CardsConfig.dizhuIndex ? 2 : 1),
                    bomb: "炸彈 x " + self.game.result.log.bomb,
                    rocket: "火箭 x " + self.game.result.log.rocket,
                    RSpring: "春天/返春 x " + self.game.result.log.RSpring,
                },
                remainCards: {
                    player1: {
                        name: global.players[self.room.players[(self.game.CardsConfig.who + 1) % 3]].uid + (((self.game.CardsConfig.who + 1) % 3) == self.game.CardsConfig.dizhuIndex ? "(地主)" : "(農民)"),
                        card1stRow: self.game.CardsConfig.cards[(self.game.CardsConfig.who + 1) % 3].slice(0, 10),
                        card2ndRow: self.game.CardsConfig.cards[(self.game.CardsConfig.who + 1) % 3].slice(10, 20),
                    },
                    player2: {
                        name: global.players[self.room.players[(self.game.CardsConfig.who + 2) % 3]].uid + (((self.game.CardsConfig.who + 2) % 3) == self.game.CardsConfig.dizhuIndex ? "(地主)" : "(農民)"),
                        card1stRow: self.game.CardsConfig.cards[(self.game.CardsConfig.who + 2) % 3].slice(0, 10),
                        card2ndRow: self.game.CardsConfig.cards[(self.game.CardsConfig.who + 2) % 3].slice(10, 20),
                    }
                },
                Personalodds: {
                    player1: {
                        personalDouble: (self.game.result.personalOdds[0] == 2) ? true : false,
                        name: global.players[self.room.players[0]].uid + (0 == self.game.CardsConfig.dizhuIndex ? "(地主)" : "(農民)"),
                        points: "1.00",
                        IsMe: (index == 0),
                    },
                    player2: {
                        personalDouble: (self.game.result.personalOdds[1] == 2) ? true : false,
                        name: global.players[self.room.players[1]].uid + (1 == self.game.CardsConfig.dizhuIndex ? "(地主)" : "(農民)"),
                        points: "2",
                        IsMe: (index == 1),
                    }, player3: {
                        personalDouble: (self.game.result.personalOdds[2] == 2) ? true : false,
                        name: global.players[self.room.players[2]].uid + (2 == self.game.CardsConfig.dizhuIndex ? "(地主)" : "(農民)"),
                        points: "-50",
                        IsMe: (index == 2),
                    },
                },
                timer: "20"
            });

        });

    }

    //搶地主時依照叫分設定:notcall/notRaise
    callDizhu(factor) {
        var self = this;
        var called = false;

        if ((factor == "notCall")) {
            this.game.CardsConfig.who = this.game.timer.whosTurn;
            this.game.result.playerChosenOdds[this.game.timer.whosTurn] = 0;
        }
        else if ((factor == "notRaise")) {
            this.game.CardsConfig.who = this.game.timer.whosTurn;
            this.game.result.playerChosenOdds[this.game.timer.whosTurn] = 0;

            //都不raise的話
            //就直接當地主 自己不能在raise
            var countNotRaise = 0;
            for (var i = 0; i < 3; i++) {
                if (this.game.result.playerChosenOdds[i] == 0)
                    countNotRaise++;
            }           
            if (countNotRaise == 2)
                for (var i = 0; i < 3; i++) {
                    this.game.result.playerChosenOdds[i] = 0;
                }

        }
        else if (factor == "call") {
            this.game.result.Odds = BASE_ODDS;
            this.game.CardsConfig.dizhuIndex = this.game.timer.whosTurn;
            this.game.CardsConfig.who = this.game.timer.whosTurn;
            this.game.result.playerChosenOdds[this.game.timer.whosTurn] = 0;

            called = true;
        }
        else if (factor == "Raise") {
            this.game.result.Odds *= 2;
            this.game.CardsConfig.dizhuIndex = this.game.timer.whosTurn;
            this.game.result.playerChosenOdds[this.game.timer.whosTurn] = 0;
        }

        this.GetCards(factor);

        //檢查是否每個人都叫分了
        var allcall = true;
        for (var i = 0; i < 3; i++) {
            if (this.game.result.playerChosenOdds[i] == -1)
                allcall = false;

        }

        this.UpdateRoomInfo();

        if (this.game.timer.stage == GameStep.callDizhu) {

            if (called) {
                this.game.result.playerChosenOdds[0] = -1;
                this.game.result.playerChosenOdds[1] = -1;
                this.game.result.playerChosenOdds[2] = -1;
                this.game.timer.stage = GameStep.RaiseDizhu;
                this.skipthisTurn();
            }
            else if (allcall) {
                //大家都不叫分
                this.UpdateCardsInfo(dataManager.cards);
                this.WaitForAnimations("None", AnimationDelay.PASScard, function () {
                    self.GameStop();
                    self.Gamestart();
                });
            }
            else {
                this.skipthisTurn();
            }

        }
        else if (this.game.timer.stage == GameStep.RaiseDizhu) {

            if (allcall) {

                this.game.result.log.dizhu = this.game.result.Odds;
                //初始化計數器 進入出牌階段
                this.game.timer.countdown = countDownSecond;
                this.game.timer.whosTurn = this.game.CardsConfig.dizhuIndex;
                this.game.CardsConfig.who = this.game.CardsConfig.dizhuIndex;

                //初始化地主:加手牌,升倍率                   
                this.game.timer.stage = GameStep.PersonalDouble;
               
                //叫完地主顯示第一張癩子牌
                var LaiZinumber = (Math.round(Math.random() * 10) % 13) + 1;
                var Animation = "laizi" + CardUtil.Card[LaiZinumber];

                self.UpdateCardsInfo(dataManager.cards);
                self.game.CardsConfig.current = [[], [], []];
               

                this.WaitForAnimations("None", 500, function () {
                    self.UpdateCardsInfo(dataManager.cards);
                    

                    //新增地主牌
                    self.game.CardsConfig.cards[self.game.CardsConfig.dizhuIndex].push(self.game.CardsConfig.Dizhu[0]);
                    self.game.CardsConfig.cards[self.game.CardsConfig.dizhuIndex].push(self.game.CardsConfig.Dizhu[1]);
                    self.game.CardsConfig.cards[self.game.CardsConfig.dizhuIndex].push(self.game.CardsConfig.Dizhu[2]);
                    DoDizhuRule.sortCard(self.game.CardsConfig.cards[self.game.CardsConfig.dizhuIndex]);
                    
                    
                    self.WaitForAnimations(Animation, AnimationDelay.laizi, function () {
                        self.Updatetimer(true);
                        DoDizhuRule.setLaiZi(self.game.CardsConfig, LaiZinumber);
                        self.UpdateCardsInfo(dataManager.cards);
                       
                    });

                });


            }
            else {
                this.skipthisTurn();
            }

        }

    }

    //將牌從牌堆移除
    RemoveCardsFromDeck(deck, cards) {

        //把出出來的牌從手牌中剃除
        cards.forEach(function (card) {

            for (var i = 0; i < deck.length; i++) {
                if (JSON.stringify(deck[i]) == JSON.stringify(card)) {
                    deck.splice(i, 1);
                    break;
                }
            }

        });

    }

}


module.exports = Room;