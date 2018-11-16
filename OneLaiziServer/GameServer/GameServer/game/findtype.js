var CardUtil = require("./partCards/CardUtil")
var CardType = require("./CardType")
var findtype = {

    GetAllType(Mycards, PreCards) {
        if (PreCards == 0) {
            return this.FindAll(Mycards, PreCards);
        }
        if (Mycards.length == 0)
            return;
        var Length = PreCards.length;
        var arr = Mycards.slice(0);//當前手牌

        arr.sort(CardUtil.gradeUp);//由小到大排序

        var Most = CardUtil.cardGrade[CardType.findMost(PreCards)];//確認當前牌桌上中最多張的牌
        var type = CardType.judgeType(PreCards);//判斷當前牌桌上的牌型
        var Result = [];
        var bomb = this.FindBomb(arr, 0);
        var rocket = this.FindRocket(arr);
        if (type == 1) {
            Result = this.FindOne(arr, Most);
        }
        if (type == 2) {
            Result = this.FindDouble(arr, Most);
        }
        if (type == 3) {
            Result = this.FindTriple(arr, Most);
        }
        if (type == 4) {
            Result = this.FindThreeOne(arr, Most);
        }
        if (type == 5) {
            Result = this.FindThreeTwo(arr, Most);
        }
        if (type == 6) {
            Result = this.FindStraight(arr, Most, Length);
        }
        if (type == 7) {
            Result = this.FindDStraight(arr, Most, Length);
        }
        if (type == 8) {
            Result = this.FindTStraight(arr, Most, Length);
        }
        if (type == 9) {
            Result = this.FindFourTwoDiff(arr, Most);
        }
        if (type == 10) {
            Result = this.FindFourTwoSame(arr, Most);
        }
        if (type == 11) {

            Result = this.FindBomb(arr, Most);
        }
        if (type == 12) {
            return Result;
        }
        //放入炸彈&火箭=======================
        if (bomb.length != 0) {
            for (var i = 0; i < bomb.length; i++) {
                Result.push(bomb[i].slice(0));
            }
        }
        if (rocket.length != 0) {
            Result.push(rocket[0].slice(0))
        }
        return Result;
    },
    CalcAllKinds(arr) {
        var res = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
        for (var i = 1; i < res.length; i++) {
            for (var j = 0; j < arr.length; j++) {
                if (arr[j].showType == "laizi")
                    res[0].push(arr[j]);
                if (CardUtil.cardGrade[arr[j].showTxt] == i) {
                    res[i].push(arr[j]);
                }
            }
        }
        return res;
    },
    FindMaxLength(arr) {
        var max = 0;
        var maxtype;
        if (arr.length == 0)
            return;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].length > max) {
                max = arr[i].length;
                maxtype = arr[i];
            }
        }
        return maxtype;
    },
    FindAll(arr, Most) {
        var Result = [];
        //放入單張====================================
        Result.push([arr[arr.length - 1]]);


        //放入對子====================================
        var double = this.FindDouble(arr, Most);
        if (double.length != 0) {
            Result.push(double[0]);
        }


        //放入三張====================================
        var triple = this.FindTriple(arr, Most);
        if (triple.length != 0) {
            Result.push(triple[0]);
            //放入三對一=================================
            var threeOne = this.FindThreeOne(arr, Most);
            Result.push(threeOne[0]);
            //放入三對二=================================
            if (double.length != 0) {
                var threeTwo = this.FindThreeTwo(arr, Most);
                Result.push(threeTwo[0]);
            }
        }
        //放入順子5~11張數================================
        for (var i = 5; i <= 12; i++) {
            var straight = this.FindStraight(arr, Most, i);
            if (straight.length != 0) {
                Result.push(straight[0]);
            }
        }


        //放入雙順6,8,10,12,14,16,18===========================
        for (var i = 6; i <= 18; i += 2) {
            var Dstraight = this.FindDStraight(arr, Most, i);
            if (Dstraight.length != 0) {
                Result.push(Dstraight[0]);
            }
        }


        //放入三順9,12,15,18================================
        for (var i = 6; i <= 18; i += 3) {
            var Tstraight = this.FindTStraight(arr, Most, i);
            if (Tstraight.length != 0) {
                Result.push(Tstraight[0]);
            }
        }


        //放入炸彈=======================================
        var Bomb = this.FindBomb(arr, Most);
        if (Bomb.length != 0) {
            //放入四帶二異
            var FourTwoDiff = this.FindFourTwoDiff(arr, Most);
            Result.push(FourTwoDiff[0]);
            //放入四帶一對
            if (double.length != 0) {
                var FourTwoSame = this.FindFourTwoSame(arr, Most);
                Result.push(FourTwoSame[0]);
            }
            Result.push(Bomb[0]);
        }


        //放入火箭=======================================
        var rocket = this.FindRocket(arr);
        if (rocket.length != 0) {
            Result.push(rocket[0]);
        }

        return Result;
    },
    FindOne(arr, Most) {
        var Result = [];
        for (var i = 0; i < arr.length; i++) {
            if (CardUtil.cardGrade[arr[i].showTxt] > Most) {
                var tmp = []
                tmp.push(arr[i])
                Result.push(tmp.slice(0));
            }
        }
        return Result;
    },
    FindDouble(arr, Most) {

        var res = this.CalcAllKinds(arr);
        var Result = [];
        for (var i = 1; i < res.length; i++) {
            if (res[i].length < 2 || i <= Most)
                continue;
            else {
                for (var j = 0; j < res[i].length; j++) {
                    for (var k = j + 1; k < res[i].length; k++) {
                        var temp = [];
                        temp.push(res[i][j]);
                        temp.push(res[i][k]);
                        Result.push(temp.slice(0).sort(CardUtil.gradeDown))
                    }
                }
            }
        }

        return Result;
    },
    FindTriple(arr, Most) {
        var res = this.CalcAllKinds(arr);
        var Result = [];
        for (var i = 1; i < res.length; i++) {
            if (res[i].length < 3 || i <= Most)
                continue;
            else {
                for (var j = 0; j < res[i].length; j++) {
                    for (var k = j + 1; k < res[i].length; k++) {
                        for (var l = k + 1; l < res[i].length; l++) {
                            var temp = [];
                            temp.push(res[i][j]);
                            temp.push(res[i][k]);
                            temp.push(res[i][l]);
                            Result.push(temp.slice(0).sort(CardUtil.gradeDown))
                        }
                    }
                }
            }
        }

        return Result;
    },
    FindBomb(arr, Most) {
        var res = this.CalcAllKinds(arr);
        var Result = [];
        for (var i = 1; i < res.length; i++) {
            if (res[i].length < 4 || i <= Most)
                continue;
            else {
                Result.push(res[i].slice(0).sort(CardUtil.gradeDown));
            }
        }
        return Result;
    },
    FindRocket(arr) {
        var res = this.CalcAllKinds(arr);
        var Result = [];
        if (res[14].length == 1 && res[15].length == 1) {
            var temp = [];
            temp.push(res[14][0]);
            temp.push(res[15][0]);
            Result.push(temp.slice(0).sort(CardUtil.gradeDown));
        }

        return Result;

    },
    FindStraight(arr, Most, Length) {
        var res = this.CalcAllKinds(arr);

        var Result = [];

        for (var i = 1; i < res.length / 2 + 1; i++) {
            var st = [];
            var count = 0;

            if (i == CardUtil.cardGrade[2] || i == CardUtil.cardGrade['g'] || i == CardUtil.cardGrade['G'] || i <= Most)
                continue;

            st.push(res[i][0]);
            count++;
            for (var j = i + 1; j < res.length; j++) {

                if (res[j].length != 0 && res[j - 1].length != 0 && j < 13) {
                    st.push(res[j][0]);
                    count++;
                    if (count == Length) {
                        Result.push(st.slice(0).sort(CardUtil.gradeDown));
                    }
                }
                else {
                    break;
                }
            }

        }
        return Result;
    },
    FindDStraight(arr, Most, Length) {
        var res = this.CalcAllKinds(arr);

        var Result = [];

        for (var i = 1; i < res.length / 2 + 1; i++) {
            var st = [];
            var count = 0;

            if (i == CardUtil.cardGrade[2] || i == CardUtil.cardGrade['g'] || i == CardUtil.cardGrade['G'] || i <= Most)
                continue;

            st.push(res[i][0]);
            st.push(res[i][1]);
            count++;
            for (var j = i + 1; j < res.length; j++) {

                if (res[j].length > 1 && res[j - 1].length > 1 && j < 13) {
                    st.push(res[j][0]);
                    st.push(res[j][1]);
                    count++;
                    if (count == Length / 2) {
                        Result.push(st.slice(0).sort(CardUtil.gradeDown));
                    }
                }
                else {
                    break;
                }
            }

        }
        return Result;
    },
    FindTStraight(arr, Most, Length) {
        var res = this.CalcAllKinds(arr);

        var Result = [];

        for (var i = 1; i < res.length / 2 + 1; i++) {
            var st = [];
            var count = 0;

            if (i == CardUtil.cardGrade[2] || i == CardUtil.cardGrade['g'] || i == CardUtil.cardGrade['G'] || i <= Most)
                continue;

            st.push(res[i][0]);
            st.push(res[i][1]);
            st.push(res[i][2]);
            count++;
            for (var j = i + 1; j < res.length; j++) {

                if (res[j].length > 2 && res[j - 1].length > 2 && j < 13) {
                    st.push(res[j][0]);
                    st.push(res[j][1]);
                    st.push(res[j][2]);
                    count++;
                    if (count == Length / 3) {
                        Result.push(st.slice(0).sort(CardUtil.gradeDown));
                    }
                }
                else {
                    break;
                }
            }

        }
        return Result;
    },
    FindThreeOne(arr, Most) {
        var res = this.CalcAllKinds(arr);

        var Result = [];
        var triple = this.FindTriple(arr);
        for (var i = 0; i < triple.length; i++) {
            if (CardUtil.cardGrade[triple[i][0].showTxt] <= Most)
                continue;
            for (var j = 0; j < res.length; j++) {
                if (res[j].length == 0)
                    continue;
                if (res[j][0].showTxt != triple[i][0].showTxt) {
                    var temp = [];
                    temp.push(res[j][0]);
                    temp.push(triple[i][0]);
                    temp.push(triple[i][1]);
                    temp.push(triple[i][2]);
                    Result.push(temp.slice(0).sort(CardUtil.gradeDown));
                }

            }
        }
        return Result;
    },

    FindThreeTwo(arr, Most) {
        var Result = [];
        var triple = this.FindTriple(arr);
        var double = this.FindDouble(arr);
        if (triple.length == 0)
            return Result;
        for (var i = 0; i < triple.length; i++) {
            if (CardUtil.cardGrade[triple[i][0].showTxt] <= Most)
                continue;
            for (var j = 0; j < double.length; j++) {
                if (double[j][0].showTxt != triple[i][0].showTxt) {
                    var temp = [];
                    temp.push(double[j][0]);
                    temp.push(double[j][1]);
                    temp.push(triple[i][0]);
                    temp.push(triple[i][1]);
                    temp.push(triple[i][2]);
                    Result.push(temp.slice(0).sort(CardUtil.gradeDown));
                }

            }
        }
        return Result;
    },

    FindFourTwoSame(arr, Most) {
        var Result = [];
        var double = this.FindDouble(arr);
        var bomb = this.FindBomb(arr);

        for (var i = 0; i < bomb.length; i++) {
            if (CardUtil.cardGrade[bomb[i][0].showTxt] <= Most)
                continue;
            for (var j = 0; j < double.length; j++) {
                var temp = [];
                if (double[j][0].showTxt != bomb[i][0].showTxt) {
                    var temp = [];
                    temp.push(double[j][0]);
                    temp.push(double[j][1]);
                    temp.push(bomb[i][0]);
                    temp.push(bomb[i][1]);
                    temp.push(bomb[i][2]);
                    temp.push(bomb[i][3]);
                    Result.push(temp.slice(0).sort(CardUtil.gradeDown));
                }
            }
        }
        return Result;
    },
    FindFourTwoDiff(arr, Most) {
        var res = this.CalcAllKinds(arr);
        var Result = [];
        var bomb = this.FindBomb(arr);

        for (var i = 0; i < bomb.length; i++) {
            if (CardUtil.cardGrade[bomb[i][0].showTxt] <= Most)
                continue;
            for (var j = 0; j < res.length; j++) {

                for (var k = 0; k < res.length; k++) {

                    var temp = [];
                    if (res[k].length == 0 || res[j].length == 0)
                        continue;
                    if (res[j][0].showTxt != bomb[i][0].showTxt && res[j][0].showTxt != res[k][0].showTxt) {
                        temp.push(res[j][0]);
                        temp.push(res[k][0]);
                        temp.push(bomb[i][0]);
                        temp.push(bomb[i][1]);
                        temp.push(bomb[i][2]);
                        temp.push(bomb[i][3]);
                        Result.push(temp.slice(0).sort(CardUtil.gradeDown));


                    }
                }
            }
        }
        return Result;
    }

};

module.exports = findtype;
