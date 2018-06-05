/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 22.04.2018
 * @version: 1.0.1
 * @app: ChannelControl 3
 * @module: AppLock
 */

let MAppLock = {

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
                '.applock NICK:GRUND*TAGE (0 = permanent) - um NICK zu sperren.',
                '.applock !NICK - um NICK zu entsperren.',
                '.applock - um eine Liste aller gesperrten User zu sehen.'
            ],
        ];
        CORE.registerLanguages('Applock', 'Help', langs);

        // Register Error Messages
        langs['keys'] = [
            'Not_Lockable',
            'Already_Locked',
            'Only_Unlockable_By_Channelowner'
        ];
        langs['items'] = [
            'Dieser Nutzer kann nicht gesperrt werden. Vielleicht gehört er zum Channel- Admin- oder Knuddelsteam?',
            'Dieser Nutzer ist bereits gesperrt.',
            'Dieser Nutzer kann nur von einem Mitglied der Channelleitung entsperrt werden.'
        ];
        CORE.registerLanguages('Applock', 'Error', langs);

        // Register General Messages
        langs['keys'] = [
            'Lock_Msg_Header',
            'Lock_Msg_Body',
            'Lock_Success',
            'Not_Yet_Locked',
            'Unlock_Success',
            'Lock_List_Prefix',
            'May_Join_Locked',
        ];
        langs['items'] = [
            'Du wurdest gesperrt!',
            'Hallo $USER,°#°Du wurdest soeben _für $DURATION_ aus dem Channel _$CHANNELNAME_ gesperrt.°#°°#°_Begründung:_°#°$REASON°#°_Ansprechpartner:_ $CMD_USER',
            'Du hast $USER erfolgreich gesperrt. Jetzt kicken: °BB°_°>/cl $USER:$REASON|/cl $USER:$REASON<°§.',
            'Dieser Nutzer ist nicht gesperrt.',
            '$USER wurde entsperrt.',
            'Zur Zeit sind folgende Nutzer gesperrt:°#°',
            'Du bist derzeit Gesperrt.°#°Grund: $REASON',
        ];
        CORE.registerLanguages('Applock', 'General', langs);

    },

    /**
     * Unlocks users automatically
     */
    autoUnlock: function () {

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

            if (targetDatas.Lock.IsLocked && targetDatas.Lock.Duration < Date.now() && targetDatas.Lock.Duration !== 0) {
                targetDatas.Lock.By = 0;
                targetDatas.Lock.IsLocked = false;
                targetDatas.Lock.Duration = 0;
                targetDatas.Lock.Reason = '';
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
     * Send help message to user
     *
     * @param user
     */
    help: function (user) {

        let msg = _LNG.Applock.Help.Usage;

        _LNG.Applock.Help.UsageCMDs.forEach(function (item) {
            msg += item + '°#°';
        });

        _Botuser.sendPrivateMessage(msg, user);

    },

    /**
     * Check if target is loackable
     *
     * @param target
     * @returns {boolean}
     */
    isLockable: function (target) {

        return !(AUser.isCCTeam(target) || target.isChannelOwner() || target.isAppManager() ||
            target.isChannelModerator() || target.getUserStatus().isAtLeast(UserStatus.Admin) ||
            target.isInTeam('MyChannel'));

    },

    /**
     * Lock user by name
     *
     * @param user
     * @param targetname
     * @param reason
     * @param duration
     */
    lockUser: function (user, targetname, reason, duration) {

        if (!_User.exists(targetname)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.User_Does_Not_Exist, user);
            return;
        }

        let target = _User.getUserById(_User.getUserId(targetname));

        if (!AUser.isExisting(target)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.User_Does_Not_Exist, user);
            return;
        }

        if (!this.isLockable(target)) {
            _Botuser.sendPrivateMessage(_LNG.Applock.Error.Not_Lockable, user);
            return;
        }

        let targetDatas = AUser.getUserDatas(target);

        if (targetDatas.Lock.IsLocked) {
            _Botuser.sendPrivateMessage(_LNG.Applock.Error.Already_Locked, user);
            return;
        }

        targetDatas.Lock.IsLocked = true;
        targetDatas.Lock.By = user.getUserId();
        targetDatas.Lock.Count += 1;
        targetDatas.Lock.Reason = reason;
        targetDatas.Lock.Duration = duration === 0 ? 0 : Date.now() + (duration * 24 * 60 * 60 * 1000);

        target.getPersistence().setObject('User', targetDatas);
        this.sendLockMessage(user, target, reason, duration)

    },

    /**
     * Send lock messages
     *
     * @param user
     * @param target
     * @param reason
     * @param duration
     */
    sendLockMessage: function (user, target, reason, duration) {

        _Botuser.sendPrivateMessage(_LNG.Applock.General.Lock_Success.formater({
            'USER': target.getNick(),
            'REASON': reason
        }), user);

        duration = duration === 0 ? 'immer' : duration + ' Tage';

        let msg = {
            'header': _LNG.Applock.General.Lock_Msg_Header,
            'body': _LNG.Applock.General.Lock_Msg_Body.formater({
                'CMD_USER': user.getNick(),
                'DURATION': duration,
                'REASON': reason
            }),
            'type': 'none',
        };

        Mailer.sendMessage(target, msg, user);

    },

    /**
     * Unlock target by nickname
     * @param user
     * @param targetname
     */
    unlockUser: function (user, targetname) {

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

        if (!targetDatas.Lock.IsLocked) {
            _Botuser.sendPrivateMessage(_LNG.Applock.General.Not_Yet_Locked, user);
            return;
        }

        if ((targetDatas.Lock.By !== user.getUserId()) && (!user.isAppManager() && !user.isChannelOwner())) {
            _Botuser.sendPrivateMessage(_LNG.Applock.Error.Only_Unlockable_By_Channelowner, user);
            return;
        }

        targetDatas.Lock.By = 0;
        targetDatas.Lock.IsLocked = false;
        targetDatas.Lock.Duration = 0;
        targetDatas.Lock.Reason = '';

        target.getPersistence().setObject('User', targetDatas);
        _Botuser.sendPrivateMessage(_LNG.Applock.General.Unlock_Success.formater({'USER': target.getNick()}), user);

    },

    /**
     * Gets every locked username
     *
     * @param user
     */
    getLockList: function (user) {

        let lockedUsers = '';

        let parameters = {
            onStart: function (accessibleUserCount) {
            },
            onEnd: function (accessibleUserCount) {
                _Botuser.sendPrivateMessage(_LNG.Applock.General.Lock_List_Prefix + lockedUsers, user);
            }

        };

        _User.eachAccessibleUser(function (user, index, accessibleUserCount) {

            if (!AUser.isExisting(user)) {
                return;
            }

            var targetDatas = AUser.getUserDatas(user);

            if (targetDatas.Lock.IsLocked) {
                lockedUsers += user.getNick() + ', '
            }

        }, parameters);

    }

};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MAppLock = function (action) {

    if (action !== 'start') {
        return;
    }

    MAppLock.preload();

};

/**
 * Extends System Cronjob
 *
 * @constructor
 */
Cronjob.MAppLock = function () {

    if (_CFG.General.LastIntervall + (60 * 1000) >= Date.now()) {
        MAppLock.autoUnlock();
    }
};

/**
 * Extends System ChatCommands
 *
 * @param user
 * @param cmd
 * @param params
 */
ChatCommands.applock = function (user, cmd, params) {

    if (!MAppLock.allowed(user)) {
        _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
        return;
    }

    if (isEmpty(params)) {
        MAppLock.getLockList(user);
        return;
    }

    let targetname = '';

    if (params.charAt(0) === '!') {
        targetname = params.replace(/!/, '');
        MAppLock.unlockUser(user, targetname);
        return;
    }

    params = params.split(':');

    if (params < 2) {
        MAppLock.help(user);
        return;
    }

    targetname = params[0];
    params = mergeSplitString(params, 2, ':');

    params = params.split('*');

    if (params < 2 || isEmpty(params[1])) {
        params[1] = 0;
    }

    MAppLock.lockUser(user, targetname, params[0], parseInt(params[1]));

};

App.chatCommands['.applock'] = function (user, params, cmd) {
    ChatCommands.applock(user, cmd, params);
};