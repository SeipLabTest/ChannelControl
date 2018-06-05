/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 07.10.2017
 * @version: 1.0.0
 * @app: ChannelControl 3
 * @system: OnMessage
 */

let OnMessage = {

    messageHandler: function (user, msg, type) {
        if (type === 'private') {
            this.pMessage(user, msg);
        }
        if (type === 'public') {
            this.oMessage(user, msg);
            return this.isCommand(msg);
        }
    },

    isCommand: function (msg) {
        if (msg.charAt(0) === _CFG.General.CommandSign) {
            return this.getCommand(msg.toLowerCase()) in ChatCommands;
        }

        return false;
    },

    getCommand: function (msg) {
        msg = msg.replace(/./, '');
        let cmd = msg.split(' ');

        return cmd[0].toLowerCase();
    },

    getParams: function (msg) {
        msg = msg.replace(/./, '');
        let cmd = msg.split(' ');

        return mergeSplitString(cmd, 2, ' ');
    },

    pMessage: function (user, msg) {
        if (this.isCommand(msg)) {
            let cmd = this.getCommand(msg);
            ChatCommands[cmd](user, cmd, this.getParams(msg));
        }
    },

    oMessage: function (user, msg) {
        if (this.isCommand(msg)) {
            let cmd = this.getCommand(msg);
            ChatCommands[cmd](user, cmd, this.getParams(msg));
        }

        let O = PublicMsgReaction;
        Object.keys(O).forEach(function (key) {
            O[key](user, msg);
        });

    },

};

let PublicMsgReaction = {};