
var config = require("./config");
var helper = require("./helper");
var CardUtil = require("./CardUtil");

var PokerData = {};

PokerData.cardNo = [
    3,4,5,6,7,8,9,10,"J","Q","K","A",2,"g","G"
]

PokerData.showData = [];
//创建纸牌数据
PokerData.setPokerData = function(){
    var num = 0;
    for(var i = 0;i < PokerData.cardNo.length;i++){
        if(i < PokerData.cardNo.length - 2){
            for(var key in config.pokerCardType){
                var pokerDataItem = {
                    showTxt : PokerData.cardNo[i],
                    showType : config.pokerCardType[key],
                    NO : num++
                }
                PokerData.showData.push(pokerDataItem)
            }
        }else{
            if(i == 13){
                var pokerDataItem = {
                    showTxt : PokerData.cardNo[i],
                    showType : config.ghostCardType.smallG,
                    NO : num++
                }
                PokerData.showData.push(pokerDataItem)
            }else if(i == 14){
                var pokerDataItem = {
                    showTxt : PokerData.cardNo[i],
                    showType : config.ghostCardType.bigG,
                    NO : num++
                }
                PokerData.showData.push(pokerDataItem)
            }
        }
    }
}
//得到纸牌数据
PokerData.getPokerData = function () {



    return PokerData.showData;
}
PokerData.bodyPokerData = [];
//将纸牌分为三份，默认第三份为地主，得20张
PokerData.partCards = function () {

    var copyPokerData = helper.copyObj(PokerData.showData);
    //每人發17張
    for(var j = 0;j < 3;j++){
        var bodyPokerDataItem = [];
        
        for(var i = 0;i < 17;i++){
            var num = Math.floor(Math.random() * (copyPokerData.length))
            var pokerData = copyPokerData[num];
            bodyPokerDataItem.push(pokerData);
            copyPokerData.splice(num,1);
           
        }
          PokerData.bodyPokerData.push(bodyPokerDataItem);
    }
    //放入剩下三張牌  
    PokerData.bodyPokerData.push(copyPokerData);
    //对纸牌数据进行排序
    for (var i = 0; i < PokerData.bodyPokerData.length; i++){
        PokerData.bodyPokerData[i].sort(CardUtil.gradeDown);
    }
}
//得到分成三份的数据
PokerData.getPartCardsData = function () {   
    return  PokerData.bodyPokerData
}
//准备纸牌数据
PokerData.load = function () {
    PokerData.showData = [];
    PokerData.bodyPokerData = [];
    PokerData.setPokerData();
    PokerData.partCards();
}
//回傳卡片序號
PokerData.CardNumber = function(Card){
    return Card.NO;
}

PokerData.Card = function (type, i) {
    if (i < 13) {
        var pokerDataItem = {
            showTxt: PokerData.cardNo[i],
            showType: config.pokerCardType[type],
        }
        return pokerDataItem;
    }
    else if (i == 13) {
        var pokerDataItem = {
            showTxt: PokerData.cardNo[i],
            showType: config.ghostCardType.smallG,
        }
        return pokerDataItem;
    }
    else if (i == 14) {
        var pokerDataItem = {
            showTxt: PokerData.cardNo[i],
            showType: config.ghostCardType.bigG,
        }
        return pokerDataItem;
    }

}

module.exports = PokerData;
