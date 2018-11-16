
cc.Class({
    extends: cc.Component,

    ctor: function () {
        this.Obj= {
            name: null
        };
        this.Info = {
            name:null
        };        
    },      


    onLoad() {
        var self = this;

        this.Obj.name = cc.find("nameandcoin/name", this.node).getComponent(cc.Label);
        this.Obj.img = cc.find("pic", this.node).getComponent(cc.Sprite);
        this.Obj.money = cc.find("nameandcoin/Money", this.node).getComponent("Num2Sprite");
        this.node.active = false;
    },

    setName: function (name) {
       
        if (name == '') {
            this.node.active = false;
        } else {
            this.node.active = true;
        }

        this.Info.name = name;
        this.Obj.name.string = name;
    },

    setImg: function (Img) {
        
        this.Obj.img.spriteFrame = Img;
    },

    setCoin: function (coin) {
        this.Obj.money.setNum(coin);
    }


});
