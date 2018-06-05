/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 22.04.2018
 * @version: 1.0.1
 * @app: ChannelControl 3
 * @module: AppMute
 */

let MAppMute = {

    /**
     * Preload configs / languages
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
                '.appmute NICK:GRUND*MINUTEN (0 = 24h) - um NICK zu muten.',
                '.appmute !NICK - um NICK zu unmuten.',
                '.appmute - um eine Liste aller muted User zu sehen.'
            ],
        ];
        CORE.registerLanguages('Appmute', 'Help', langs);

        // Register Error Messages
        langs['keys'] = [
            'Not_Muteable',
            'Already_Muted',
            'Only_Unmuteable_By_Channelowner'
        ];
        langs['items'] = [
            'Dieser Nutzer kann nicht gemuted werden. Vielleicht gehört er zum Channel- Admin- oder Knuddelsteam?',
            'Dieser Nutzer ist bereits muted.',
            'Dieser Nutzer kann nur von einem Mitglied der Channelleitung entmuted werden.'
        ];
        CORE.registerLanguages('Appmute', 'Error', langs);

        // Register General Messages
        langs['keys'] = [
            'Mute_Msg',
            'Mute_Success',
            'Not_Yet_Muted',
            'Unmute_Success',
            'Mute_List_Prefix',
        ];
        langs['items'] = [
            'Hallo $USER,°#°Du wurdest soeben _für $DURATION Minuten_ gemuted!°#°°#°_Begründung:_°#°$REASON°#°_Ansprechpartner:_ $CMD_USER',
            'Du hast $USER erfolgreich gemuted.',
            'Dieser Nutzer ist nicht muted.',
            '$USER wurde entmuted.',
            'Zur Zeit sind folgende Nutzer gemuted:°#°',
        ];
        CORE.registerLanguages('Appmute', 'General', langs);

    },

    /**
     * Unmutes users automatically
     */
    autoUnmute: function () {

        let parameters = {
            onStart: function (accessibleUserCount) {
            },
            onEnd: function (accessibleUserCount) {
            }

        };

        _User.eachAccessibleUser(function (user, index, accessibleUserCount) {

            if (!AUser.isExisting(user)) {
                return;
            }

            var targetDatas = AUser.getUserDatas(user);

            if (targetDatas.Mute.IsMuted && targetDatas.Mute.Duration < Date.now()) {
                targetDatas.Mute.By = 0;
                targetDatas.Mute.IsMuted = false;
                targetDatas.Mute.Duration = 0;
                targetDatas.Mute.Reason = '';
                user.getPersistence().setObject('User', targetDatas);
            }

        }, parameters);

    },

    /**
     * Check if user is allowed to use this command
     *
     * @param user
     * @returns {Boolean}
     */
    allowed: function (user) {

        return user.isChannelOwner() || user.isAppManager() || user.isChannelModerator();

    },

    /**
     * Send help to user
     *
     * @param user
     */
    help: function (user) {

        let msg = _LNG.Appmute.Help.Usage;

        _LNG.Appmute.Help.UsageCMDs.forEach(function (item) {
            msg += item + '°#°';
        });

        _Botuser.sendPrivateMessage(msg, user);

    },

    /**
     * Check if target is muteable
     *
     * @param target
     * @returns {boolean}
     */
    isMuteable: function (target) {

        return !(AUser.isCCTeam(target) || target.isChannelOwner() || target.isAppManager() ||
            target.isChannelModerator() || target.getUserStatus().isAtLeast(UserStatus.Admin) ||
            target.isInTeam('MyChannel'));

    },

    /**
     * Mute user by name
     *
     * @param user
     * @param targetname
     * @param reason
     * @param duration
     */
    muteUser: function (user, targetname, reason, duration) {

        if (!_User.exists(targetname)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.User_Does_Not_Exist, user);
            return;
        }

        let target = _User.getUserById(_User.getUserId(targetname));

        if (!AUser.isExisting(target)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.User_Does_Not_Exist, user);
            return;
        }

        if (!this.isMuteable(target)) {
            _Botuser.sendPrivateMessage(_LNG.Appmute.Error.Not_Muteable, user);
            return;
        }

        let targetDatas = AUser.getUserDatas(target);

        if (targetDatas.Mute.IsMuted) {
            _Botuser.sendPrivateMessage(_LNG.Appmute.Error.Already_Muted, user);
            return;
        }

        duration = duration === 0 ? 1440 : duration;

        targetDatas.Mute.IsMuted = true;
        targetDatas.Mute.Duration = Date.now() + (duration * 60 * 1000);
        targetDatas.Mute.Reason = reason;
        targetDatas.Mute.By = user.getUserId();
        targetDatas.Mute.Count += 1;

        target.getPersistence().setObject('User', targetDatas);

        this.sendMuteMessage(user, target, reason, duration);

    },

    /**
     * Send mute messages
     *
     * @param user
     * @param target
     * @param reason
     * @param duration
     */
    sendMuteMessage: function (user, target, reason, duration) {

        _Botuser.sendPrivateMessage(_LNG.Appmute.General.Mute_Success.formater({
            'USER': target.getNick(),
            'REASON': reason
        }), user);

        _Botuser.sendPrivateMessage(_LNG.Appmute.General.Mute_Msg.formater({
            'USER': target.getNick(),
            'CMD_USER': user.getNick(),
            'DURATION': duration,
            'REASON': reason
        }), target);

    },

    /**
     * Unmute user by name
     *
     * @param user
     * @param targetname
     */
    unmuteUser: function (user, targetname) {

        if (!_User.exists(targetname)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.User_Does_Not_Exist, user);
            return;
        }

        let target = _User.getUserById(_User.getUserId(targetname));

        if (!AUser.isExisting(target)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.User_Does_Not_Exist, user);
            return;
        }

        let targetDatas = AUser.getUserDatas(target);

        if (!targetDatas.Mute.IsMuted) {
            _Botuser.sendPrivateMessage(_LNG.Appmute.General.Not_Yet_Muted, user);
            return;
        }

        if ((targetDatas.Mute.By !== user.getUserId()) && (!user.isAppManager() && !user.isChannelOwner())) {
            _Botuser.sendPrivateMessage(_LNG.Appmute.Error.Only_Unmuteable_By_Channelowner, user);
            return;
        }

        targetDatas.Mute.By = 0;
        targetDatas.Mute.IsMuted = false;
        targetDatas.Mute.Duration = 0;
        targetDatas.Mute.Reason = '';
        target.getPersistence().setObject('User', targetDatas);

        _Botuser.sendPrivateMessage(_LNG.Appmute.General.Unmute_Success.formater({'USER': target.getNick()}), user);

    },

    /**
     * Get list of muted users
     *
     * @param user
     */
    getMuteList: function (user) {

        let mutedUsers = '';

        let parameters = {
            onStart: function (accessibleUserCount) {
            },
            onEnd: function (accessibleUserCount) {
                _Botuser.sendPrivateMessage(_LNG.Appmute.General.Mute_List_Prefix + mutedUsers, user);
            }

        };

        _User.eachAccessibleUser(function (user, index, accessibleUserCount) {

            if (!AUser.isExisting(user)) {
                return;
            }

            var targetDatas = AUser.getUserDatas(user);

            if (targetDatas.Mute.IsMuted) {
                mutedUsers += user.getNick() + ', '
            }

        }, parameters);

    },

};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MAppMute = function (action) {

    if (action !== 'start') {
        return;
    }

    MAppMute.preload();

};

/**
 * Extends System Cronjob
 *
 * @constructor
 */
Cronjob.MAppMute = function () {
    if (_CFG.General.LastIntervall + (60 * 1000) >= Date.now()) {
        MAppMute.autoUnmute();
    }
};

/**
 * Extends System ChatCommands
 *
 * @param user
 * @param cmd
 * @param params
 */
ChatCommands.appmute = function (user, cmd, params) {

    if (!MAppMute.allowed(user)) {
        _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
        return;
    }

    if (isEmpty(params)) {
        MAppMute.getMuteList(user);
        return;
    }

    let targetname = '';

    if (params.charAt(0) === '!') {
        targetname = params.replace(/!/, '');
        MAppMute.unmuteUser(user, targetname);
        return;
    }

    params = params.split(':');

    if (params < 2) {
        MAppMute.help(user);
        return;
    }

    targetname = params[0];
    params = mergeSplitString(params, 2, ':');

    params = params.split('*');

    if (params < 2 || isEmpty(params[1])) {
        params[1] = 0;
    }

    MAppMute.muteUser(user, targetname, params[0], parseInt(params[1]));

};

App.chatCommands['.appmute'] = function (user, params, cmd) {
    ChatCommands.appmute(user, cmd, params);
};