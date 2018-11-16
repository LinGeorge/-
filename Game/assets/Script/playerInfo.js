
cc.Class({
    extends: cc.Component,

    ctor: function () {
        this.playerInfo = null;
        this.playerScript = {
            PreRival: null,
            Me: null,
            NextRival:null
        }
        this.defaultImgs = ["player/img/playerPic1", "player/img/playerPic2", "player/img/playerPic3","player/img/playerPic4"];
        this.autoPlaying = null;
    },

    properties: {
        
        Me: {
                default:null,
                type: cc.Node
        },
        PreRival: {
                default: null,
                  type: cc.Node         
        },
        NextRival: {
                default: null,
               type: cc.Node          
        }
        

    },
  
    autoPlay() {
        global.EventListener.fire("AIswitch");

    },

    onLoad() {
        var self = this;
        this.autoPlaying = cc.find("AutoPlaying", this.node.parent);
        
        this.playerScript.PreRival = this.PreRival.getComponent("player");
        this.playerScript.Me = this.Me.getComponent("player");
        this.playerScript.NextRival = this.NextRival.getComponent("player");


        cc.loader.loadResDir("player/img", function (err, assets) { });

        global.socket.on("playerInfo", function (Info) {       
            self.playerInfo = Info;
            self.UpdateRoom(Info);
        });

        global.EventListener.on("AIswitch", function () {
            global.socket.emit("AIswitch", global.uid, function (IsAI) {
                self.autoPlaying.active = IsAI
            });
        });
      

    },

    //根據this.RoomInfo從新設定物件資訊
    UpdateRoom(playerInfo) {

        var self = this;

        this.playerScript.Me.setName(playerInfo.me.name);
        this.playerScript.PreRival.setName(playerInfo.PreRival.name);
        this.playerScript.NextRival.setName(playerInfo.NextRival.name); 


        this.playerScript.Me.setCoin(playerInfo.me.coin);
        this.playerScript.PreRival.setCoin(playerInfo.PreRival.coin);
        this.playerScript.NextRival.setCoin(playerInfo.NextRival.coin); 


        this.autoPlaying.active = playerInfo.IsAI;

         if (playerInfo.me.img != null)
            cc.loader.loadRes(this.defaultImgs[playerInfo.me.img], cc.SpriteFrame, function (err, spriteFrame) {
               
            self.playerScript.Me.setImg(spriteFrame);          
        })


        if (playerInfo.PreRival.img != null)
        cc.loader.loadRes(this.defaultImgs[playerInfo.PreRival.img], cc.SpriteFrame, function (err, spriteFrame) {
            self.playerScript.PreRival.setImg(spriteFrame);
        })


        if (playerInfo.NextRival.img != null)
        cc.loader.loadRes(this.defaultImgs[playerInfo.NextRival.img], cc.SpriteFrame, function (err, spriteFrame) {
            self.playerScript.NextRival.setImg(spriteFrame);
        })   

   }, 

});
