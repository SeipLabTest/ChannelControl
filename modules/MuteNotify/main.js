/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 22.04.2018
 * @version: 1.0.1
 * @app: ChannelControl 3
 * @module: Mute Notify
 */

let MMuteNotify = {

    /**
     * Preload configuration / languages
     */
    preload: function () {
        let langs = ['keys', 'items'];

        // Register General Messages
        langs['keys'] = [
            'CM_Notify',
            'CM_Notified',
            'No_CM_Online'
        ];
        langs['items'] = [
            '$USER wurde gemuted. °>Jetzt entmuten|/mute !$USER<°',
            'Ich habe soeben die Channel-Moderatoren über deinen Mute benachrichtigt. Sie werden dich sicher gleich entmuten.',
            'Aktuell ist kein Channel-Moderator anwesend, der dich entmuten könnte.'
        ];
        CORE.registerLanguages('MuteNotify', 'General', langs);
    },

    intervall: function () {

        let muted = this.getMutedUsers();

        muted.forEach(function (item) {
            if (!MMuteNotify.isAlreadyNotifed(item)) {
                if (MMuteNotify.sendTeamMessage(item)) {
                    _Botuser.sendPrivateMessage(_LNG.MuteNotify.General.CM_Notified, item);
                    _CFG.MuteNotify.Notified.push(item.getUserId());
                }
                else {
                    _Botuser.sendPrivateMessage(_LNG.MuteNotify.General.No_CM_Online, item);
                }
            }
        });

        _CFG.MuteNotify.Notified.forEach(function (item) {
            let target = _User.getUserById(item);
            if (!target.isMuted()) {
                let index = _CFG.MuteNotify.Notified.indexOf(item);
                if (index > -1) {
                    _CFG.MuteNotify.Notified.splice(index, 1);
                }
            }

        });

    },

    getMutedUsers: function () {
        let usersInChannel = _Channel.getOnlineUsers(UserType.Human);
        let targets = [];

        usersInChannel.forEach(function (item) {
            if (item.isMuted()) {
                targets.push(item);
            }
        });

        return targets;

    },

    isAlreadyNotifed: function (target) {

        return _CFG.MuteNotify.Notified.indexOf(target.getUserId()) !== -1;

    },

    /**
     * Get online channel moderators
     *
     * @returns {Array}
     */
    getOnlineTeam: function () {

        let cm = _Channel.getChannelConfiguration().getChannelRights().getChannelModerators();
        let team = [];
        let receivers = [];

        // Push all cm into team
        for (let i = 0; i < cm.length; i++) {
            if (team.indexOf(cm[i].getNick()) === -1) {
                team.push(cm[i].getNick());
            }
        }

        // Push every online team user in receivers
        for (let i = 0; i < team.length; i++) {
            var user = _User.getUserById(_User.getUserId(team[i]));
            if (user.isOnlineInChannel()) {
                receivers.push(user);
            }
        }

        return receivers;

    },

    /**
     * Send team message
     *
     * @param target
     */
    sendTeamMessage: function (target) {

        let team = this.getOnlineTeam();

        if (isEmpty(team)) {
            return false;
        }

        // Add prefix and formate message
        let msg = _LNG.MuteNotify.General.CM_Notify.formater({
            'USER': target.getNick()
        });

        // Send message to all team users
        team.forEach(function (item) {
            _Botuser.sendPrivateMessage(msg, item);
        });

        return true;

    },


};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MMuteNotify = function (action) {

    if (action !== 'start') {
        return;
    }

    if ('MuteNotify' in _CFG) {
        _CFG.MuteNotify.Notified = [];
    }
    MMuteNotify.preload();

};

/**
 * Extends System Cronjob
 *
 * @constructor
 */
Cronjob.MMuteNotify = function () {

    if (_CFG.General.LastIntervall + (60 * 1000) >= Date.now()) {
        if (_CFG.MuteNotify.IsActive) {
            MMuteNotify.intervall();
        }
    }

};

MACP.UI.mutenotify = {
    type: 'popup',
    content: AppContent.popupContent(new HTMLFile('/acp/cfg_mutenotify.html'), 650, 420)
};

MACP.ACPUIDatas.mutenotify = function () {

    let dataObject = {
        'IsActive': _CFG.MuteNotify.IsActive,
    };
    return dataObject;

};