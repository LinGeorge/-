
var global = require('./global');

var GameStep = Object.freeze({
    "Waiting": 0, "GameStart": 1, "callDizhu": 2, "RaiseDizhu": 3
    , "PersonalDouble": 4, "Playing": 5, "choseLaiziCard": 6, "Result": 7
});

var dataManager = {

    //I:room.game
    timer: function (game, index, cleanUp) {
        var Info = game.timer;

        var transferData = {
            active: null, //按鍵是否可按
            whosTurn: null, //鬧鐘顯示位置:Me,Next,Pre
            countdownSecond: null, //倒數秒數
        };

        if (cleanUp)
            return transferData;

        //---------------------------------------------算出計數器顯示的位置
        switch (Info.whosTurn - index) {
            case 1:
            case -2:
                transferData.whosTurn = 'Next';
                break;
            case 0:
                transferData.whosTurn = 'Me';
                break;
            case -1:
            case 2:
                transferData.whosTurn = 'Pre';
                break;
        }
        //----------------------------------------------- 
        
        //加倍/不加階段大家同時進行
        if (Info.stage == GameStep.PersonalDouble)
            transferData.whosTurn = "Me";

        //當輪流出牌時輪到那位玩家才顯示按鈕
          transferData.active = transferData.whosTurn == "Me" ? Info.stage : null;

        //選玩加倍/不加的玩家不再顯示button
        if ((Info.stage == GameStep.PersonalDouble) && (game.result.personalOdds[index] != -1))
            transferData.active = null;

        transferData.countdownSecond = Info.countdown;
      
        //列隊及顯示遊戲開始階段不顯示緊鈴及倒數
        if (Info.stage == GameStep.Waiting || Info.stage == GameStep.GameStart) {
            transferData.active = Info.stage;
            transferData.whosTurn = null;
            transferData.countdownSecond=null;
        }

        if (Info.stage == GameStep.Result) {
            transferData.active = Info.stage;
            transferData.whosTurn = "Result";
        }

        return transferData;
    },    

    //I:room
    room: function (Info,index) {
        
        var transferData = {
            playerPoint: null, //目前點數
            currentOdds: null, //目前賠分
            odds: null //賠分賠率
        };

        if (Info.game.timer.stage != GameStep.Waiting) {
            transferData.playerPoint = "....";
            transferData.currentOdds = 12345;
            transferData.odds = Info.game.result.Odds;
        }

        return transferData;
    },

    //I:room.room
    player: function (Info, index) {

        var transferData = {
            me: {
                name: null,
                img: null,
                coin:1234
            },
            NextRival: {
                name: null,
                img: null,
                coin:"12,004.56"
            },
            PreRival: {
                name: null,
                img: null,
                coin:null
            },
        };
        if (typeof (transferData.IsAI = global.players[Info.players[index % 3]]) == "undefined") return transferData;

       
        transferData.IsAI = global.players[Info.players[index % 3]].IsAI;

        transferData.me.name = global.players[Info.players[index % 3]].uid;
        transferData.NextRival.name = Info.players[(index + 1) % 3] == null ? '' : global.players[Info.players[(index + 1) % 3]].uid;
        transferData.PreRival.name = Info.players[(index - 1) % 3] == null ? '' : global.players[Info.players[(index - 1) % 3]].uid;

        transferData.me.img = global.players[Info.players[index % 3]].img;
        transferData.NextRival.img = Info.players[(index + 1) % 3] == null ? null : global.players[Info.players[(index + 1) % 3]].img;
        transferData.PreRival.img = Info.players[(index - 1) % 3] == null ? null : global.players[Info.players[(index - 1) % 3]].img;



        return transferData;
    },

    //I:room.game
    cards: function (game, index) {

        var Info = game.CardsConfig;

        var transferData = {
            DizhuCards: [], //地主牌
            MyCards: null, //我的手牌
            currentStatus: {
                Me: null,
                Pre: null,
                Next: null
            },//目前牌型
            PreRivalCards: 0, //前一位玩家的手牌數
            NextRivalCards: 0, //後一位玩家的手牌數
            IsDizhu: {
                Me: null,
                Pre: null,
                Next: null
            }
        }
        if (game.timer.stage > GameStep.RaiseDizhu) {
            transferData.DizhuCards = Info.Dizhu;
            transferData.IsDizhu.Me = Info.dizhuIndex == (index % 3) ? true : null;
            transferData.IsDizhu.Pre = Info.dizhuIndex == ((index - 1) % 3) ? true : null;
            transferData.IsDizhu.Next = Info.dizhuIndex == ((index + 1) % 3) ? true : null;
        }
        else if (game.timer.stage != GameStep.Waiting) {
            transferData.DizhuCards = [null, null, null];
        }

        transferData.currentStatus.Me = Info.current[index % 3];
        transferData.currentStatus.Pre = Info.current[(index - 1) % 3];
        transferData.currentStatus.Next = Info.current[(index + 1) % 3];

        transferData.MyCards = Info.cards[index % 3];

        if ((game.result.personalOdds[game.CardsConfig.dizhuIndex] == 2) && (game.timer.stage > GameStep.PersonalDouble)) {

            if (((index - 1) % 3) == game.CardsConfig.dizhuIndex)
                transferData.PreRivalCards = Info.cards[(index - 1) % 3];
            else
                transferData.PreRivalCards = Info.cards[(index - 1) % 3].length;
            if (((index + 1) % 3) == game.CardsConfig.dizhuIndex)
                transferData.NextRivalCards = Info.cards[(index + 1) % 3];
            else
                transferData.NextRivalCards = Info.cards[(index + 1) % 3].length;

        }
        else {
            transferData.PreRivalCards = Info.cards[(index - 1) % 3].length;
            transferData.NextRivalCards = Info.cards[(index + 1) % 3].length;
        }



        return transferData;
    },
    clearCards: function (Info, index) {
        var transferData = {
            DizhuCards: [],
            MyCards: [],
            currentStatus: {
                Me: [],
                Pre: [],
                Next: []
            },
            PreRivalCards: 0,
            NextRivalCards: 0,
            IsDizhu: {
                Me: null,
                Pre: null,
                Next: null
            }
        }

        return transferData;

    },

};

module.exports = dataManager;