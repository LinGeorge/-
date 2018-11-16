

cc.Class({
    extends: cc.Component,

    ctor: function(){
        this.Obj = {
            dizhuWin: null,
            farmerWin: null,
            odds: {
                dizhu: null,
                bomb: null,
                rocket: null,
                RSpring:null
            },
            remainCards: {
                player1: {
                    name: null,
                    card1stRow: null,
                    card2ndRow:null,
                },
                player2: {
                    name: null,
                    card1stRow: null,
                    card2ndRow: null,
                }
            },
            Personalodds: {
                player1: {
                    personalDouble: null,
                    name: null,
                    points: null,
                    IsMe:null,
                },
                player2: {
                    personalDouble: null,
                    name: null,
                    points: null,
                    IsMe: null,
                },
                player3: {
                    personalDouble: null,
                    name: null,
                    points: null,
                    IsMe: null,
                },
            },
            timer:null
        }
        this.cardsPool = null;
    },

    init() {

        this.Obj = {
            dizhuWin: cc.find("Winner/landlordWin",this.node),
            farmerWin: cc.find("Winner/farmerWin", this.node),
            odds: {
                dizhu: cc.find("OddsDetails/detail/Dizhu/str", this.node),
                bomb: cc.find("OddsDetails/detail/bomb/str", this.node),
                rocket: cc.find("OddsDetails/detail/rocket/str", this.node),
                RSpring: cc.find("OddsDetails/detail/RSpring/str", this.node),
            },
            remainCards: {
                player1: {
                    name: cc.find("RemainCards/player1/name", this.node),
                    card1stRow: cc.find("RemainCards/player1/Cards/1stRow", this.node),
                    card2ndRow: cc.find("RemainCards/player1/Cards/2ndRow", this.node),
                },
                player2: {
                    name: cc.find("RemainCards/player2/name", this.node),
                    card1stRow: cc.find("RemainCards/player2/Cards/1stRow", this.node),
                    card2ndRow: cc.find("RemainCards/player2/Cards/2ndRow", this.node),
                }
            },
            Personalodds: {
                player1: {
                    personalDouble: cc.find("OddResult/Player1/personalDouble", this.node),
                    name: cc.find("OddResult/Player1/name", this.node),
                    points: cc.find("OddResult/Player1/point", this.node),
                    IsMe: cc.find("OddResult/Player1/IsMe", this.node),
                },
                player2: {
                    personalDouble: cc.find("OddResult/Player2/personalDouble", this.node),
                    name: cc.find("OddResult/Player2/name", this.node),
                    points: cc.find("OddResult/Player2/point", this.node),
                    IsMe: cc.find("OddResult/Player2/IsMe", this.node),
                },
                player3: {
                    personalDouble: cc.find("OddResult/Player3/personalDouble", this.node),
                    name: cc.find("OddResult/Player3/name", this.node),
                    points: cc.find("OddResult/Player3/point", this.node),
                    IsMe: cc.find("OddResult/Player3/IsMe", this.node),
                },
            },
            timer: cc.find("timer", this.node)
        }
        this.cardsPool = cc.find("CardManager/CardsPool", this.node.parent.parent).getComponent("CardsPool");
    },

    onLoad() {

        var self = this;

        this.init();

        global.EventListener.on("InRoom", function () {
            global.socket.emit("InRoom", global.uid, function (loaded) {
                if (loaded) {
                    global.socket.emit('LoadGame', global.uid);
                }
            });
        });
        
        global.socket.on("ResultMessage", function (Info) {
            self.setResult(Info);
        });

    },

    setResult(Info) {

        this.Obj["dizhuWin"].active = false;
        this.Obj["farmerWin"].active = false;
        this.Obj[Info.whoWin].active = true;        


        this.Obj.odds.dizhu.getComponent(cc.Label).string = Info.odds.dizhu;
        this.Obj.odds.bomb.getComponent(cc.Label).string = Info.odds.bomb;
        this.Obj.odds.rocket.getComponent(cc.Label).string = Info.odds.rocket;
        this.Obj.odds.RSpring.getComponent(cc.Label).string = Info.odds.RSpring;

        this.Obj.remainCards.player1.name.getComponent(cc.Label).string = Info.remainCards.player1.name;
        this.cardsPool.ArrangeCards(Info.remainCards.player1.card1stRow, this.Obj.remainCards.player1.card1stRow, false);
        this.cardsPool.ArrangeCards(Info.remainCards.player1.card2ndRow, this.Obj.remainCards.player1.card2ndRow, false);

        this.Obj.remainCards.player2.name.getComponent(cc.Label).string = Info.remainCards.player2.name.toString();
        this.cardsPool.ArrangeCards(Info.remainCards.player2.card1stRow, this.Obj.remainCards.player2.card1stRow, false);
        this.cardsPool.ArrangeCards(Info.remainCards.player2.card2ndRow, this.Obj.remainCards.player2.card2ndRow, false);

        this.Obj.Personalodds.player1.personalDouble.active = Info.Personalodds.player1.personalDouble;
        this.Obj.Personalodds.player1.name.getComponent(cc.Label).string = Info.Personalodds.player1.name;
        this.Obj.Personalodds.player1.points.getComponent("Num2Sprite").setNum(Info.Personalodds.player1.points, (Info.Personalodds.player1.points[0] == "-" ? 'redletter/redletter' :"greenletter/greenletter"));
        this.Obj.Personalodds.player1.IsMe.active = Info.Personalodds.player1.IsMe;


        this.Obj.Personalodds.player2.personalDouble.active = Info.Personalodds.player2.personalDouble;
        this.Obj.Personalodds.player2.name.getComponent(cc.Label).string = Info.Personalodds.player2.name;
        this.Obj.Personalodds.player2.points.getComponent("Num2Sprite").setNum(Info.Personalodds.player2.points, (Info.Personalodds.player2.points[0] == "-" ? 'redletter/redletter' : "greenletter/greenletter"));
        this.Obj.Personalodds.player2.IsMe.active = Info.Personalodds.player2.IsMe;


        this.Obj.Personalodds.player3.personalDouble.active = Info.Personalodds.player3.personalDouble;
        this.Obj.Personalodds.player3.name.getComponent(cc.Label).string = Info.Personalodds.player3.name;
        this.Obj.Personalodds.player3.points.getComponent("Num2Sprite").setNum(Info.Personalodds.player3.points, (Info.Personalodds.player3.points[0] == "-" ? 'redletter/redletter' : "greenletter/greenletter"));
        this.Obj.Personalodds.player3.IsMe.active = Info.Personalodds.player3.IsMe;

        this.Obj.timer.getComponent("Num2Sprite").setNum(Info.timer);
    },

    InRoom() {
        global.EventListener.fire("InRoom");
        this.node.enable = false;
    }


});
