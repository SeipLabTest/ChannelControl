/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 21.03.2018
 * @version: 1.1.0
 * @app: ChannelControl 3
 * @system: OnJoinLeft
 */

let OnJoinLeft = {

    handler: function (user, action) {

        let O = OnJoinLeft;
        Object.keys(O).forEach(function (key) {
            if (key !== 'handler') {
                O[key](user, action);
            }
        });

        let userDatas = user.getPersistence().getObject('User');
        userDatas.LastLoginTime = Date.now();

    },

    ownerWelcome: function (user, action) {

        if (action !== 'join') {
            return;
        }

        if ((user.isChannelOwner() || user.isAppManager()) && _CFG.OwnerMsgStatus) {
            _Botuser.sendPrivateMessage(_LNG.System.General.Owner_Welcome_Message, user);
        }

    },

};