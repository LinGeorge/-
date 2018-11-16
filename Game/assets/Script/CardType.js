
/**
 0  "錯誤牌型",
 1  "單張", x1
 2  "對子", x2
 3  "三張牌", x3
 4  "三帶一", x4
 5  "三帶二", x4
 6  "單順子", x5up
 7  "雙順子", x6
 8  "三順子", x9
 9  "四帶二單", x6
 10"四帶一對", x6
 11"炸彈", x4
 12"火箭", x2 Gg
 13"飛機"
 14"軟炸彈"
*/
const CardUtil = require('./CardUtil');
var CardType = {

    Types: [
        "錯誤牌型",
        "單張",
        "對子",
        "三張牌",
        "三帶一",
        "三帶二",
        "單順子",
        "雙順子",
        "三順子",
        "四帶二單",
        "四帶一對",
        "炸彈",
        "火箭",
        "飛機",
        "軟炸彈"
    ],

    judgeType(cards) {
        if (cards == "PASS")
            return 0;
        if (cards == null || cards.length == 0) {
            return 0;
        }

        var SortedCard = JSON.parse(JSON.stringify(cards))
        SortedCard.sort(CardUtil.gradeUp);
        if (this.isSingle(SortedCard)) { return 1; }//單張
        if (this.isDouble(SortedCard)) { return 2; }//兩張
        if (this.isTriple(SortedCard)) { return 3 }//三張
        if (this.isThreeOne(SortedCard)) { return 4 }//三帶一
        if (this.isThreeTwo(SortedCard)) { return 5 }//三帶二
        if (this.isStraight(SortedCard)) { return 6 }//單順
        if (this.isDStraight(SortedCard)) { return 7; }//雙順
        if (this.isTStraight(SortedCard)) { return 8; }//三順
        if (this.isFourTwoDiff(SortedCard)) { return 9 }//四帶二單
        if (this.isFourTwoSame(SortedCard)) { return 10 }//四帶一對
        if (this.isBomb(SortedCard)) { return 11 }//炸彈
        if (this.isRocket(SortedCard)) { return 12 }//火箭
        if (this.isAirplane(SortedCard)) { return 13 }//飛機
        if (this.isSoftBomb(SortedCard)) { return 14 }//軟炸彈
        return 0;
    },
    classifyTypes(cards) {
        if (!cards.length) return
        if (cards.length == 1) return cards[0].showTxt;

        var res = {};
        for (var i = 0; i < cards.length; i++) {
            if (!res[cards[i].showTxt]) {
                res[cards[i].showTxt] = 1
            } else {
                res[cards[i].showTxt]++
            }
        }
        return res;
    },
    isSingle(cards) {
        if (cards.length != 1) { return false; }
        return true;
    },
    isDouble(cards) {
        if (cards.length != 2) { return false; }
        if (cards[0].showTxt == cards[1].showTxt) { return true }
        return false;
    },
    isTriple(cards) {
        if (cards.length != 3) { return false; }
        if (cards[0].showTxt == cards[1].showTxt && cards[0].showTxt == cards[2].showTxt) { return true }
        return false;
    },
    isThreeOne(cards) {
        if (cards.length != 4) { return false; }
        var res = this.classifyTypes(cards);
        var keys = Object.keys(res);
        if (keys.length != 2) { return false; }

        if (res[keys[0]] == 3 && res[keys[1]] == 1 || res[keys[0]] == 1 && res[keys[1]] == 3)
            return true;

        return false;
    },
    isThreeTwo(cards) {
        if (cards.length != 5) { return false; }
        var res = this.classifyTypes(cards);
        var keys = Object.keys(res);
        if (keys.length != 2) { return false; }

        if (res[keys[0]] == 3 && res[keys[1]] == 2 || res[keys[0]] == 2 && res[keys[1]] == 3)
            return true;

        return false;
    },
    isTStraight(cards) {
        if (cards.length % 3 != 0 || cards.length < 6 || this.findCard(cards, 2)) {
            return false;
        }

        if (cards.length >= 6 && cards.length % 3 == 0) {
            var res = this.classifyTypes(cards);

            var keys = Object.keys(res);
            if (keys.length < 2) { return false; }


            for (var i = 1; i < keys.length; i++) {
                if (res[keys[i]] != 3 || res[keys[i - 1]] != 3)
                    return false;
                if (Math.abs(CardUtil.cardGrade[keys[i]] - CardUtil.cardGrade[keys[i - 1]]) != 1) {
                    return false;
                }
            }
            return true;
        }
    },
    isDStraight(cards) {
        if (cards.length % 2 != 0) {
            return false
        }
        if (cards.length < 6 || this.findCard(cards, 2)) {
            return false;
        }
        if (this.findCard(cards, 2)) {
            return false;
        }
        if (cards.length >= 6 && cards.length % 2 == 0) {
            var res = this.classifyTypes(cards);
            var keys = Object.keys(res);
            if (keys.length < 3) { return false; }
            for (var i = 1; i < keys.length; i++) {
                if (res[keys[i]] != 2 || res[keys[i - 1]] != 2)
                    return false;
                if (Math.abs(CardUtil.cardGrade[keys[i]] - CardUtil.cardGrade[keys[i - 1]]) != 1) {
                    return false;
                }
            }
            return true;
        }

    },
    isStraight(cards) {
        if (cards.length < 5) {
            return false;
        }
        if (this.findCard(cards, 2)) {
            return false;
        }
        else {


            for (var i = 1; i < cards.length; i++) {
                if (Math.abs(CardUtil.cardGrade[cards[i].showTxt] - CardUtil.cardGrade[cards[i - 1].showTxt]) != 1) {
                    return false;
                }
            }
            return true;
        }
    },
    isRocket(cards) {
        if (cards.length != 2) { return false };
        if (cards[0].showTxt == "G" && cards[1].showTxt == "g" || cards[1].showTxt == "G" && cards[0].showTxt == "g")
            return true;
        return false;
    },
    isBomb(cards) {
        if (cards.length != 4) { return false; }
        for (var i = 0; i < cards.length; i++) {
            if (cards.showType == "laizi")
                return false;
        }
        for (var i = 1; i < cards.length; i++) {
            if (cards[i].showTxt != cards[i - 1].showTxt) { return false }
        }
        return true;
    },
    isSoftBomb(cards) {
        if (cards.length < 4) { return false; }

        for (var i = 1; i < cards.length; i++) {
            if (cards[i].showTxt != cards[i - 1].showTxt) { return false }
        }
        return true;
    },
    isFourTwoSame(cards) {
        if (cards.length != 6) { return false; }
        var res = this.classifyTypes(cards);
        var keys = Object.keys(res);
        if (keys.length != 2) { return false; }

        if (res[keys[0]] == 4 && res[keys[1]] == 2 || res[keys[0]] == 2 && res[keys[1]] == 4)
            return true;

        return false;
    },
    isFourTwoDiff(cards) {
        if (cards.length != 6) { return false; }
        var res = this.classifyTypes(cards);
        var keys = Object.keys(res);
        if (keys.length != 3) { return false; }

        if (res[keys[0]] == 4 && res[keys[1]] == 1 && res[keys[2]] == 1 ||
            res[keys[0]] == 1 && res[keys[1]] == 4 && res[keys[2]] == 1 ||
            res[keys[0]] == 1 && res[keys[1]] == 1 && res[keys[2]] == 4)
            return true;

        return false;
    },
    isAirplane(cards) {

        if (cards.length < 6) {
            return false;
        };
        if (cards.length % 4 != 0 && cards.length % 5 != 0)
            return false;
        var res = this.classifyTypes(cards);
        var keys = Object.keys(res);
        if (keys.length < 4) { return false; }
        console.log(res);
        var triple = [];
        var double = [];
        var single = [];
        for (var i = 0; i < keys.length; i++) {
            if (res[keys[i]] == 3)
                triple.push(keys[i]);
            if (res[keys[i]] == 2)
                double.push(keys[i]);
            if (res[keys[i]] == 1)
                single.push(keys[i]);
        }
        console.log(single);
        console.log(double);
        console.log(triple);
        if (triple.length < 2)
            return false;
        if (double.length < 2 && single.length < 2)
            return false;
        for (var i = 1; i < triple.length; i++) {
            if (Math.abs(CardUtil.cardGrade[triple[i]] - CardUtil.cardGrade[triple[i - 1]]) != 1)
                return false;
        }
        if ((triple.length == double.length && single.length == 0) || (triple.length == single.length && double.length == 0))
            return true;
        else
            return false;

    },
    findMost(arr) {
        if (!arr.length) return
        if (arr.length == 1) return arr[0].showTxt;
        var res = {}
        for (var i = 0, l = arr.length; i < l; i++) {
            if (!res[arr[i].showTxt]) {
                res[arr[i].showTxt] = 1
            } else {
                res[arr[i].showTxt]++
            }
        }

        var keys = Object.keys(res)
        var maxNum = 0, maxEle
        var k
        for (var i = 0, l = keys.length; i < l; i++) {
            if (res[keys[i]] > maxNum) {
                maxNum = res[keys[i]]
                k = i;
                maxEle = keys[i]
            }
        }

        return keys[k];
    },
    findCard(cards, text) {
        for (var i = 0; i < cards.length; i++) {
            if (cards[i].showTxt == text)
                return 1;
        }
        return 0;
    }
};



module.exports = CardType;