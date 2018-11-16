
cc.Class({
    extends: cc.Component,

    ctor: function () {
        this.waring = null;
    },

    properties: {

        //��J�ϥΪ̦W�٪�����
        edit_box: {
            default: null,
            type: cc.EditBox
        },

        //��ܿ��~�T����label
        Message: {
            default: null,
            type: cc.Label
        },

    },


    //login�����s
    LoginbuttonClick(event, customData) {

        //�NgameController��this����r�x�s,���U��functions�i�եΨ�this.Message
        var self = this;

        //�ˬd�W�٬O�_���ť�
        if (this.edit_box.string.length == 0) {
            self.Message.string = "Empty is not allowed"
            return;
        }

        //Ĳ�ologin�ƥ�,�o�esocket��uid��server
        global.EventListener.fire("login", this.edit_box.string);      

    },
    onLoad() {        
        var self = this;
        //�Х߱���login�ƥ�
        global.EventListener.on("login", function (uid) {
            //�Nuser ID �ǵ����A����
            global.socket.emit("login", uid, function (Success) {

                if (Success) {
                    global.uid = uid;
                    global.EventListener.fire("SwitchScene", 1);
                    global.socket.emit('LoadGame', global.uid);
                }
                else {
                    self.Message.string('FAILED');
                }                
            });
        });              
    }

});
