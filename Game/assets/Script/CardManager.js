
const findtype = require('./findtype');
const LaiZifindType = require('./LaiZifindType')
cc.Class({
    extends: cc.Component,


    ctor: function () {
        this.CardObj = {
            DizhuCards: null,
            MyCards: null,
            currentStatus: {
                Me: null,
                Pre: null,
                Next: null
            },
            PreRivalCards: null,
            NextRivalCards: null,
            PreRivalCardsNum: null,
            NextRivalCardsNum: null,
        }
        this.cardsPool = null;
        this.cardInfo = null;
    },

    properties: {

        playerInfo: {
            default: null,
            type: cc.Node
        }
    },

    init() {


        this.CardObj = {
            DizhuCards: cc.find("DizhuCards", this.node),
            MyCards: cc.find("MyCards", this.node),
            currentStatus: {
                Me: cc.find("currentStatus/Me", this.node),
                Pre: cc.find("currentStatus/Pre", this.node),
                Next: cc.find("currentStatus/Next", this.node)
            },
            PreRivalCards: cc.find("PreRival/cards", this.node),
            NextRivalCards: cc.find("NextRival/cards", this.node),
            PreRivalCardsNum: cc.find("PreRival/length", this.node),
            NextRivalCardsNum: cc.find("NextRival/length", this.node),
            IsDizhu: {
                Me: cc.find("Me/dizhuIcon", this.playerInfo),
                Pre: cc.find("Pre/dizhuIcon", this.playerInfo),
                Next: cc.find("Next/dizhuIcon", this.playerInfo)
            },
        }
        this.cardsPool = cc.find("CardsPool", this.node).getComponent("CardsPool");

    },
    onEnable() {
        this.UpdateCards({
            DizhuCards: [],
            IsDizhu: { Me: null, Pre: null, Next: null },
            MyCards: [],
            NextRivalCards: 0,
            PreRivalCards: 0,
            currentStatus: {
                Me: [],
                Next: [],
                Pre: []
            }
        });
    },
    onLoad() {
        var self = this;

        this.init();

        global.socket.on("GetCards", function (Info) {
            //將牌更新                    
            self.UpdateCards(Info);
        });

        global.EventListener.on("SubmitCards", function (cards) {
            global.socket.emit("SubmitCards", global.uid, cards);
        });

        global.EventListener.on("ChoseDizhu", function (factor) {
            global.socket.emit("ChoseDizhu", global.uid, factor);
        });

        global.EventListener.on("GetCardsInfo", function (InfoName) {
            return self.GetCardInfo(InfoName);
        });

        global.EventListener.on("CallDouble", function (factor) {
            global.socket.emit("CallDouble", global.uid, factor);
        });

        global.socket.on("ShowLaiziPossibleTypes", function (cards) {

            var s1 = cc.find("stages/selectCard/cards/select1", self.node.parent);
            var s2 = cc.find("stages/selectCard/cards/select2", self.node.parent);

            if (typeof (cards[0]) != "undefined") {
                self.cardsPool.ArrangeCards(cards[0], s1, false);
            }
            else {
                cc.find("stages/selectCard/buttons/btn0").active = false;
            }
            if (typeof (cards[1]) != "undefined") {
                self.cardsPool.ArrangeCards(cards[1], s2, false);
            }
            else {
                cc.find("stages/selectCard/buttons/btn1").active = false;

            }
            
        });


    },

    GetCardInfo(Info) {
        var self = this;

        if (self.cardInfo == null)
            return "No Data";

        switch (Info) {
            case "Me":
                return self.cardInfo.MyCards.length;
            case "Pre":
                if (typeof (self.cardInfo.PreRivalCards) == "number")
                    return self.cardInfo.PreRivalCards;
                else
                    return self.cardInfo.PreRivalCards.length;
            case "Next":
                if (typeof (self.cardInfo.NextRivalCards) == "number")
                    return self.cardInfo.NextRivalCards;
                else
                    return self.cardInfo.NextRivalCards.length;
            case "MyCard":
                return self.cardInfo.MyCards;
            case "current":
                if (typeof (self.cardInfo.currentStatus.Pre) != "string")
                    return self.cardInfo.currentStatus.Pre;
                else if (typeof (self.cardInfo.currentStatus.Next) != "string")
                    return self.cardInfo.currentStatus.Next;
                else
                    return 0;
            default:
                return "ERROR";
        }
    },

    HintClicked(event, customData) {

        global.ButtonCounting += 1;
        this.Reselect();
        this.showHint(global.ButtonCounting);

    },
    //提示功能
    showHint(ButtonCounting) {

        var HintCards = findtype.GetAllType(this.GetCardInfo("MyCard"), this.GetCardInfo("current"));


        //若沒有任何適合的牌可壓，直接pass
        if (HintCards.length == 0) {
            global.EventListener.fire("Animation", "nolegalCard", "Me");
            //global.EventListener.fire("EndMyturn", global.roomid);
            global.ButtonCounting = -1;
            return;
        }
        //計算按下提示按鈕的次數以便挑選提示的牌
        if (ButtonCounting > HintCards.length - 1) {
            global.ButtonCounting = 0;
            ButtonCounting = 0;
        }

        //將提示的牌組跳起
        for (var k = 0; k < HintCards[ButtonCounting].length; k++) {
            var HintCardNO = HintCards[ButtonCounting][k].NO;
            for (var i = 0; i < this.CardObj.MyCards.getChildren().length; i++) {
                var Card = this.CardObj.MyCards.getChildren()[i].getComponent("PokerControl").CardInfo.data;
                var CardNO = Card.NO;
                if (HintCardNO == CardNO) {
                    this.CardObj.MyCards.getChildren()[i].getComponent("PokerControl").select();
                }

            }
        }

    },

    callDouble(event, customData) {
        global.EventListener.fire("CallDouble", parseInt(customData));
    },

    UpdateCards(Info) {

        this.cardInfo = Info;

        //顯示地主的三張底牌
        if (Info.DizhuCards.length != 0) {
            this.CardObj.DizhuCards.active = true;
        }
        else {
            this.CardObj.DizhuCards.active = false;
        }
        this.cardsPool.ArrangeCards(Info.DizhuCards, this.CardObj.DizhuCards, false);

        //顯示自己的手牌
        this.cardsPool.ArrangeCards(Info.MyCards, this.CardObj.MyCards, true);

        //顯示前一個對手的牌數     
        if (typeof (Info.PreRivalCards) == "number") {

            this.cardsPool.ArrangeCards(Info.PreRivalCards != 0 ? [null] : [], this.CardObj.PreRivalCards.getChildren()[0], false);
            this.cardsPool.ArrangeCards([], this.CardObj.PreRivalCards.getChildren()[1], false);
            this.CardObj.PreRivalCardsNum.getComponent("Num2Sprite").setNum(Info.PreRivalCards != 0 ? Info.PreRivalCards : "");

        }
        else if (typeof (Info.PreRivalCards) == "object") {

            this.CardObj.PreRivalCardsNum.getComponent("Num2Sprite").setNum("");
            this.cardsPool.ArrangeCards(Info.PreRivalCards.slice(0, 10), this.CardObj.PreRivalCards.getChildren()[0], false);
            this.cardsPool.ArrangeCards(Info.PreRivalCards.slice(10, 20), this.CardObj.PreRivalCards.getChildren()[1], false);
        }


        //顯示下一個對手的牌數       

        if (typeof (Info.NextRivalCards) == "number") {

            this.cardsPool.ArrangeCards(Info.NextRivalCards != 0 ? [null] : [], this.CardObj.NextRivalCards.getChildren()[0], false);
            this.cardsPool.ArrangeCards([], this.CardObj.NextRivalCards.getChildren()[1], false);
            this.CardObj.NextRivalCardsNum.getComponent("Num2Sprite").setNum(Info.NextRivalCards != 0 ? Info.NextRivalCards : "");
        }
        else if (typeof (Info.NextRivalCards) == "object") {
            this.CardObj.NextRivalCardsNum.getComponent("Num2Sprite").setNum("");
            this.cardsPool.ArrangeCards(Info.NextRivalCards.slice(0, 10), this.CardObj.NextRivalCards.getChildren()[0], false);
            this.cardsPool.ArrangeCards(Info.NextRivalCards.slice(10, 20), this.CardObj.NextRivalCards.getChildren()[1], false);
        }

        //顯示目前牌面上的牌    
        this.cardsPool.ArrangeCards(Info.currentStatus.Me, this.CardObj.currentStatus.Me, false);
        this.cardsPool.ArrangeCards(Info.currentStatus.Pre, this.CardObj.currentStatus.Pre, false);
        this.cardsPool.ArrangeCards(Info.currentStatus.Next, this.CardObj.currentStatus.Next, false);

        //顯示地主頭像
        if (Info.IsDizhu.Me == null) {
            this.CardObj.IsDizhu.Me.active = false;
        }
        else {
            this.CardObj.IsDizhu.Me.active = true;
        }

        if (Info.IsDizhu.Pre == null) {
            this.CardObj.IsDizhu.Pre.active = false;
        }
        else {
            this.CardObj.IsDizhu.Pre.active = true;
        }

        if (Info.IsDizhu.Next == null) {
            this.CardObj.IsDizhu.Next.active = false;
        }
        else {
            this.CardObj.IsDizhu.Next.active = true;
        }


    },

    SubmitCard() {
        var self = this;
        var cards = [];

        this.CardObj.MyCards.children.forEach(function (card) {
            if (card.getPositionY() == 20)
                cards.push(card.getComponent("PokerControl").getValue());
        });
        cc.log(LaiZifindType.findCardType(cards));
        console.log(cards);
        global.EventListener.fire("SubmitCards", cards);
    },

    ChoseDizhu(event, customData) {
        global.EventListener.fire("ChoseDizhu", customData);
    },

    LaiZiCardSelect(event, customData) {
        global.EventListener.fire("SubmitCards", parseInt(customData));
    },

    Reselect() {
        var self = this;
        this.CardObj.MyCards.children.forEach(function (card) {

            card.getComponent("PokerControl").unselect();
        });
    },

});
