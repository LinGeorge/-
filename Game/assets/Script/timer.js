const alarm = 5;//��N�i�P�ɷQĵ�a
cc.Class({
    extends: cc.Component,


    ctor: function () {
        this.Obj = {
            clock: null,
            Me: null,
            Pre: null,
            Next: null,
            warning: {                
                Me: null,
                Pre: null,
                Next:null,
            }
        }
    },

    properties: {       

        stage: {
            default: null,
            type: cc.Node
        },
    },

    Reset() {

        this.Obj.warning.Me.active = false;
        this.Obj.warning.Pre.active = false;
        this.Obj.warning.Next.active = false;
        this.Obj.clock.active = false;
        this.activeButton(null);
    },

    init() {

        this.Obj = {
            clock:cc.find("Clock", this.node),
            Me: cc.find("Me", this.node),
            Pre: cc.find("Pre", this.node),
            Next: cc.find("Next", this.node),
            warning: {
                Me: cc.find("warning/Me", this.node),
                Pre: cc.find("warning/Pre", this.node),
                Next: cc.find("warning/Next", this.node),
            }
        }

    },
    start() {
        var self = this;

        this.init();

        global.socket.on("timer", function (Info) {
            //�N�p�ƾ���s      
              self.UpdateCounter(Info);
        });

        global.EventListener.on("EndMyturn", function (roomid) {
            global.socket.emit("EndMyturn", global.uid);

        })

        this.Reset();
        this.activeButton(-1);
        
    },

    activeButton(Type) {
                            
        for (var i = 0; i < this.stage.getChildren().length; i++) {
            this.stage.getChildren()[i].active = (i == Type);           
        }


    },

    //��s�˼ƭp�ɾx��
    UpdateCounter(timerInfo) {       

        this.Reset();

        this.activeButton(timerInfo.active);

        if (timerInfo.whosTurn == "Result") {
            cc.find("Result/timer", this.stage).getComponent("Num2Sprite").setNum(timerInfo.countdownSecond);
        }
        else
        if (timerInfo.whosTurn != null) {
            this.Obj.clock.active = true;
            this.Obj.clock.position = this.Obj[timerInfo.whosTurn].position;
            this.Obj.clock.getComponent("clock").settime(timerInfo.countdownSecond);
            if (timerInfo.countdownSecond < 10)
                this.Obj.clock.getComponent(cc.Animation).play();

            if (global.EventListener.fire("GetCardsInfo", timerInfo.whosTurn) < alarm) {
                this.Obj.warning[timerInfo.whosTurn].active = true;
                this.Obj.warning[timerInfo.whosTurn].getComponent(cc.Animation).play();               
            }
        }       


    },

    //�����ڪ��^�X(�X�P)
    EndMyturn() {
        global.EventListener.fire("EndMyturn", global.roomid);
        global.ButtonCounting = -1;
    }

});
