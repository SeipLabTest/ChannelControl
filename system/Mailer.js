/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 12.10.2017
 * @version: 1.0.0
 * @app: ChannelControl 3
 * @system: Mailer
 */

let Mailer = {

    /**
     * Get the right signature
     *
     * @param type
     * @returns {string}
     */
    getSignature: function (type) {

        let signature = '';

        switch (type) {
            case 'newsletter':
                signature = _LNG.Newsletter.General.Signature;
                break;
            default:
                signature = _LNG.System.Mailer.Signature;
                break;
        }

        return signature;

    },

    /**
     * Send message
     *
     * @param receiver
     * @param msg
     * @param sender
     */
    sendMessage: function (receiver, msg, sender) {

        let header = this.replacePlaceholders(receiver, msg.header, sender);
        let body = msg.body + this.getSignature(msg.type);
        body = this.replacePlaceholders(receiver, body, sender);

        _Botuser.sendPostMessage(header, body, receiver);

    },

    /**
     * Replace placeholders
     *
     * @param receiver
     * @param text
     * @param sender
     * @returns {string}
     */
    replacePlaceholders: function (receiver, text, sender) {

        return text.formater({
            'USER': receiver.getNick(),
            'CHANNELNAMELINK': '°>' + _Channel.getChannelName() + '|/go ' + _Channel.getChannelName() + '<°',
            'CHANNELNAME': _Channel.getChannelName(),
            'BOTNAME': _Botuser.getNick(),
            'SENDER': sender.getNick(),
            'APPNAME': _AppInstance.getAppInfo().getAppName(),
            'APPVERSION': _AppInstance.getAppInfo().getAppVersion(),
        });

    }

};