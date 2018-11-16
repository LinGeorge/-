
var CardUtil = {};
CardUtil.Card = ['0', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
//CardUtil.GradetoCard = ['0', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
CardUtil.cardGrade = {
    3: 1,
    4: 2,
    5: 3,
    6: 4,
    7: 5,
    8: 6,
    9: 7,
    10: 8,
    J: 9,
    Q: 10,
    K: 11,
    A: 12,
    2: 13,
    g: 14,
    G: 15,
};
CardUtil.GradetoCard = {
    1: 3,
    2: 4,
    3: 5,
    4: 6,
    5: 7,
    6: 8,
    7: 9,
    8: 10,
    9: 'J',
    10: 'Q',
    11: 'K',
    12: 'A',
    13: 2
}
CardUtil.typeGrade = {
    spade: 4,//黑桃
    hearts: 3,//红桃
    redslice: 2,//红方
    blackberry: 1,//黑梅
}
CardUtil.typeDown = function (card1, card2) {
    return CardUtil.typeGrade[card2.showType] - CardUtil.typeGrade[card1.showType]
}
//降序排列，考慮花色&數字
CardUtil.gradeDown = function (card1, card2) {
    var Numcmp = CardUtil.cardGrade[card2.showTxt] - CardUtil.cardGrade[card1.showTxt]
    var Typecmp = CardUtil.typeGrade[card2.showType] - CardUtil.typeGrade[card1.showType]
    if (Numcmp > 0)
        return 1;
    else if (Numcmp == 0 && Typecmp > 0)
        return 1;
    else if (Numcmp == 0 && Typecmp < 0)
        return -1;

    return CardUtil.cardGrade[card2.showTxt] - CardUtil.cardGrade[card1.showTxt]
}

//升序排列
CardUtil.gradeUp = function (card1, card2) {

    var Numcmp = CardUtil.cardGrade[card1.showTxt] - CardUtil.cardGrade[card2.showTxt]
    var Typecmp = CardUtil.typeGrade[card1.showType] - CardUtil.typeGrade[card2.showType]
    if (Numcmp > 0)
        return 1;
    else if (Numcmp == 0 && Typecmp > 0)
        return 1;
    else if (Numcmp == 0 && Typecmp < 0)
        return -1;

    return CardUtil.cardGrade[card1.showTxt] - CardUtil.cardGrade[card2.showTxt]

}
CardUtil.Laizi = function (card1, card2) {
    var Numcmp = CardUtil.cardGrade[card2.showTxt] - CardUtil.cardGrade[card1.showTxt]
    var Typecmp = CardUtil.typeGrade[card2.showType] - CardUtil.typeGrade[card1.showType]
    if (card2.showType == "laizi" && card1.showType != "laizi")
        return 1;
    if (card2.showType != "laizi" && card1.showType == "laizi")
        return -1;
    if (Numcmp > 0)
        return 1;
    else if (Numcmp == 0 && Typecmp > 0)
        return 1;
    else if (Numcmp == 0 && Typecmp < 0)
        return -1;

    return CardUtil.cardGrade[card2.showTxt] - CardUtil.cardGrade[card1.showTxt]
}



module.exports = CardUtil;
