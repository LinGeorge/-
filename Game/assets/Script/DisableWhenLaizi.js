

cc.Class({
    extends: cc.Component,

    properties: {
    },


    onEnable() {

        this.getComponent(cc.Button).interactable = true;


        var current = global.EventListener.fire("GetCardsInfo", "current");
        var MyCard = global.EventListener.fire("GetCardsInfo", "MyCard");
        var hasLaiziCard = false;

        for (var i = 0; i < MyCard.length; i++) {
            if (typeof (MyCard[i]) != undefined) {
                if (MyCard[i].showType == "laizi") {
                    hasLaiziCard = true;
                    break;
                }
            }
        }

        if ((current == 0) && (hasLaiziCard)) {
            this.getComponent(cc.Button).interactable = false;
        }
        else {
            this.getComponent(cc.Button).interactable = true;
        }

    }

});
