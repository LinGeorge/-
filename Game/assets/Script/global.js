"use strict";

//�����ܼ� �Ω��x�s�Ȥ�ݪ�socket �ϥΪ̦W��......

var EventListener = function EventListener(obj) {

    var Register = {};

    //�s�WĲ�o�ƥ�name
    obj.on = function (name, method) {

        //�YĲ�o�ƥ�W�ٲĤ@���ϥΪ�l�s�Ŷ�
        if (!Register.hasOwnProperty(name)) {
            Register[name] = [];
        }

        //�N��k�����W���x�s
        Register[name].push(method);
    };

    //�޵o�ƥ�name
    obj.fire = function (name) {

        if (Register.hasOwnProperty(name)) {

            //�x�s�Ҧ�������functions
            var handleList = Register[name];

            //�̧�run�C��function
            for (var i = 0; i < handleList.length; i++) {

                var handler = handleList[i];
                var args = [];

                //��keyword arguments���o���榹function(fire)�ǤJ��args
                //�q1�}�l�O�]��arguments[0]���Q�nĲ�o�ƥ󪺦W��(�ܼ�name),����~�}�l���Ѽ�
                //console.log(arguments);
                for (var j = 1; j < arguments.length; j++) {
                    args.push(arguments[j]);
                }

                return handler.apply(handler, args);
            }
        }
    };

    return obj;
};

var global = {

    //T4 307
    //ServerURL: "http://140.118.175.76:3000/",

    //TR509
    //ServerURL: "http://140.118.47.172:3000/",

    ServerURL: "http://127.0.0.1:3000/",

    EventListener: EventListener({}),
    socket: null,
    uid: null,
    roomid: null,
    ButtonCounting: -1,
    ConnectServer: function ConnectServer() {
        this.socket = io(this.ServerURL, {
            reconnection: false
        });
    }

};