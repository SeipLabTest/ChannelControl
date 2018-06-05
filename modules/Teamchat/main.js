/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 10.10.2017
 * @version: 1.0.0
 * @app: ChannelControl 3
 * @module: Teamchat
 */

let MTeamchat = {

    /**
     * Preload configuration / languages
     */
    preload: function () {
        let langs = ['keys', 'items'];

        // Register Help Messages
        langs['keys'] = [
            'Usage',
            'UsageCMDs',
        ];
        langs['items'] = [
            'Bitte die Funktion folgendermaßen verwenden:°#°',
            [
                '.teamchat TEXT - um allen anwesenden Teammitgliedern TEXT zu senden',
            ],
        ];
        CORE.registerLanguages('Teamchat', 'Help', langs);

        // Register General Messages
        langs['keys'] = [
            'Nobody_Online',
            'Team_Msg_Prefix',
        ];
        langs['items'] = [
            'Es sind zur Zeit keine Teammitglieder im Channel.',
            '°BB°_$USER@TEAM:§'
        ];
        CORE.registerLanguages('Teamchat', 'General', langs);
    },

    /**
     * Check if user is allowed to use this command
     *
     * @param user
     * @returns {boolean}
     */
    allowed: function (user) {
        return !(!user.isAppDeveloper() && !user.isChannelOwner() && !user.isAppManager() && !user.isEventModerator()
            && !user.isChannelModerator());
    },

    /**
     * Send help to user
     *
     * @param user
     */
    help: function (user) {
        let msg = _LNG.Teamchat.Help.Usage;

        _LNG.Teamchat.Help.UsageCMDs.forEach(function (item) {
            msg += item + '°#°';
        });

        _Botuser.sendPrivateMessage(msg, user);
    },

    /**
     * Get team message receivers
     *
     * @returns {Array}
     */
    getReceivers: function () {

        let owners = _Channel.getChannelConfiguration().getChannelRights().getChannelOwners();
        let manager = _AppInstance.getAppInfo().getAppManagers();
        let em = _Channel.getChannelConfiguration().getChannelRights().getEventModerators();
        let cm = _Channel.getChannelConfiguration().getChannelRights().getChannelModerators();
        let team = [];
        let receivers = [];

        // Push all owners into team
        for (let i = 0; i < owners.length; i++) {
            team.push(owners[i].getNick());
        }

        // Push all manager into team
        for (let i = 0; i < manager.length; i++) {
            if (team.indexOf(manager[i].getNick()) === -1) {
                team.push(manager[i].getNick());
            }
        }

        // Push all event moderators into team
        for (let i = 0; i < em.length; i++) {
            if (team.indexOf(em[i].getNick()) === -1) {
                team.push(em[i].getNick());
            }
        }

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
     * @param user
     * @param msg
     */
    sendTeamMessage: function (user, msg) {

        let team = this.getReceivers();

        // Check if there is another team user in channel
        if (team.length < 2) {
            _Botuser.sendPrivateMessage(_LNG.Teamchat.General.Nobody_Online, user);
            return;
        }

        // Add prefix and formate message
        msg = _LNG.Teamchat.General.Team_Msg_Prefix + ' ' + msg;
        msg = msg.formater({
            'USER': user.getProfileLink()
        });

        // Send message to all team users
        team.forEach(function (item, key) {
            _Botuser.sendPrivateMessage(msg, team[key]);
        });

    },


};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MTeamchat = function (action) {

    if (action !== 'start') {
        return;
    }

    MTeamchat.preload();

};

/**
 * Extends ChatCommands
 *
 * @param user
 * @param cmd
 * @param params
 */
ChatCommands.teamchat = function (user, cmd, params) {

    // Check if user is allowed to use this command
    if (!MTeamchat.allowed(user)) {
        _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
        return;
    }

    // Check if params is empty
    if (isEmpty(params)) {
        MTeamchat.help(user);
        return;
    }

    MTeamchat.sendTeamMessage(user, params);

};

App.chatCommands['.teamchat'] = function (user, params, cmd) {
    ChatCommands.teamchat(user, cmd, params);
};