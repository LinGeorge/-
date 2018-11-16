

cc.Class({
    extends: cc.Component,

    properties: {

        Scenes: {

            default: [],
            type: cc.Node
        }
    },

    onLoad() {
        //���������ƥ� �N�s���H�~��scenes������
        let self = this;
            
            global.ConnectServer();

            global.EventListener.on("SwitchScene", function (SceneIndex) {

                if (SceneIndex == 0)
                    self.Scenes[0].active = true;
                else
                    self.Scenes[0].active = false;
            });

            global.socket.on("SwitchScene", function (SceneIndex) {
                global.EventListener.fire("SwitchScene", SceneIndex);
            });

            global.EventListener.fire("SwitchScene", 0);
 
        
    }


});
