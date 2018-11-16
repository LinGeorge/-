var CardUtil = require("./partCards/CardUtil")
var CardType = require("./CardType")
var findtype = require("./findtype")

var LaiZifindType = {

    findCardType(cards) {
        var res = findtype.CalcAllKinds(cards);
        if (res[0].length == 0)
            return cards;
        var tempCard = JSON.parse(JSON.stringify(cards))
        var Laizis = this.GetAllLaiZi(cards, tempCard);//取出所有癩子
        var tryNum = this.TryNumber(Laizis);//將所有賴子的排列組合寫入tryNum
        var Result = this.TryLaiZis(tempCard, tryNum);
        return Result;
    },

    GetAllLaiZi(cards, tempCard) {//取得所有賴子
        var Laizis = [];
        for (var j = 0; j < cards.length; j++) {
            if (cards[j].showType == "laizi") {
                Laizis.push(JSON.parse(JSON.stringify(cards[j])));//取出癩子牌放入Laizis
                tempCard.splice(0, 1);  //刪除原牌中的癩子
            }
        }
        return Laizis;
    },
    TryNumber(cards) {//回傳所有賴子可能
        var Res = [];

        var arr = JSON.parse(JSON.stringify(cards));
        if (arr.length == 0) { return [] }
        if (arr.length == 1) {
            for (var i = 1; i <= 13; i++) {
                arr[0].showTxt = CardUtil.GradetoCard[i];
                Res.push([JSON.parse(JSON.stringify(arr[0]))]);
            }
            return Res;
        }
        if (arr.length == 2) {
            for (var i = 1; i <= 13; i++) {
                for (var j = i; j <= 13; j++) {
                    arr[0].showTxt = CardUtil.GradetoCard[i];
                    arr[1].showTxt = CardUtil.GradetoCard[j];
                    var item = [JSON.parse(JSON.stringify(arr[0])), JSON.parse(JSON.stringify(arr[1]))]
                    Res.push(JSON.parse(JSON.stringify(item)));
                }
            }


            return Res;
        }
        if (arr.length == 3) {
            for (var i = 1; i <= 13; i++) {
                for (var j = i; j <= 13; j++) {
                    for (var k = j; k <= 13; k++) {
                        arr[0].showTxt = CardUtil.GradetoCard[i];
                        arr[1].showTxt = CardUtil.GradetoCard[j];
                        arr[2].showTxt = CardUtil.GradetoCard[k];
                        var item = [JSON.parse(JSON.stringify(arr[0])), JSON.parse(JSON.stringify(arr[1])), JSON.parse(JSON.stringify(arr[2]))].sort(CardUtil.gradeDown)
                        Res.push(JSON.parse(JSON.stringify(item)));
                    }
                }
            }
            return Res;
        }
        if (arr.length == 4) {
            for (var i = 1; i <= 13; i++) {
                for (var j = i; j <= 13; j++) {
                    for (var k = j; k <= 13; k++) {
                        for (var l = k; l <= 13; l++) {
                            arr[0].showTxt = CardUtil.GradetoCard[i];
                            arr[1].showTxt = CardUtil.GradetoCard[j];
                            arr[2].showTxt = CardUtil.GradetoCard[k];
                            arr[3].showTxt = CardUtil.GradetoCard[l];
                            var item = [JSON.parse(JSON.stringify(arr[0])), JSON.parse(JSON.stringify(arr[1])), JSON.parse(JSON.stringify(arr[2])), JSON.parse(JSON.stringify(arr[3]))].sort(CardUtil.gradeDown)
                            Res.push(JSON.parse(JSON.stringify(item)));
                        }
                    }
                }
            }
            return Res;
        }

    },
    TryLaiZis(tempCard, tryNum) {

        var Result = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
        for (var i = 0; i < tryNum.length; i++) {//一一帶入嘗試
            var tryCard = JSON.parse(JSON.stringify(tempCard));
            for (var j = 0; j < tryNum[0].length; j++) {//將tryNum中的數字帶回牌組
                tryCard.push(tryNum[i][j]);

            }
            tryCard.sort(CardUtil.gradeDown);//重新排列
            var type = CardType.judgeType(tryCard);
            if (type != 0) {//當為合法牌就寫入result
                Result[type].push(JSON.parse(JSON.stringify(tryCard)));
            }
        }
        return Result;
    }
}

module.exports = LaiZifindType;