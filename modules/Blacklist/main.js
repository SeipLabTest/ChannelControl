/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 17.10.2017
 * @version: 1.0.0
 * @app: ChannelControl 3
 * @module: Blacklist
 */

let MBlacklist = {

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
                '.blacklist NICK - um NICK auf die Blacklist zu setzen.',
                '.blacklist !NICK - um NICK von der Blacklist zu entfernen.',
                '.blacklist - um die Blacklist anzuzeigen.'
            ],
        ];
        CORE.registerLanguages('Blacklist', 'Help', langs);

        // Register General Messages
        langs['keys'] = [
            'User_Already_Blacklisted',
            'User_Not_Yet_Blacklisted',
            'Not_Joinable'
        ];
        langs['items'] = [
            'Dieser Nutzer steht schon auf der Blacklist.',
            'Dieser Nutzer steht nicht auf der Blacklist.',
            'Du stehst auf der Blacklist.'
        ];
        CORE.registerLanguages('Blacklist', 'Error', langs);

        // Register General Messages
        langs['keys'] = [
            'User_Blacklisted_Success',
            'User_Removed_Success',
            'Blacklist_Prefix',
        ];
        langs['items'] = [
            '$USER wurde auf die Blacklist gesetzt.',
            '$USER wurde von der Blacklist entfernt.',
            'Zur Zeit stehen folgende Nutzer auf der Blacklist:°#°'
        ];
        CORE.registerLanguages('Blacklist', 'General', langs);

    },

    /**
     * Sends help message to user
     *
     * @param user
     */
    help: function (user) {

        let msg = _LNG.Blacklist.Help.Usage;

        _LNG.Blacklist.Help.UsageCMDs.forEach(function (item) {
            msg += item + '°#°';
        });

        _Botuser.sendPrivateMessage(msg, user);

    },

    /**
     * Check if user is allowed to use this command
     *
     * @param user
     * @returns {boolean}
     */
    allowed: function (user) {

        return user.isChannelOwner() || user.isAppManager();

    },

    isBlacklisted: function (user) {

        let index = _CFG.Blacklist.userIDs.indexOf(user.getUserId());

        return index > -1;

    },

    /**
     * Adds user id to blacklist
     *
     * @param user
     * @param targetname
     */
    addUserByName: function (user, targetname) {

        if (!_User.exists(targetname)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.User_Does_Not_Exist, user);
            return true;
        }

        let uid = _User.getUserId(targetname);
        if (_CFG.Blacklist.userIDs.indexOf(uid) > -1) {
            _Botuser.sendPrivateMessage(_LNG.Blacklist.Error.User_Already_Blacklisted, user);
            return true;
        }

        _CFG.Blacklist.userIDs.push(uid);
        CORE.reloadConfig();
        _Botuser.sendPrivateMessage(_LNG.Blacklist.General.User_Blacklisted_Success.formater({'USER': targetname}), user);
        return true;

    },

    /**
     * Removes user id from blacklist
     *
     * @param user
     * @param targetname
     */
    removeUserByName: function (user, targetname) {

        if (!_User.exists(targetname)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.User_Does_Not_Exist, user);
            return true;
        }

        let uid = _User.getUserId(targetname);
        let index = _CFG.Blacklist.userIDs.indexOf(uid);

        if (index > -1) {
            _CFG.Blacklist.userIDs.splice(index, 1);
            CORE.reloadConfig();
            _Botuser.sendPrivateMessage(_LNG.Blacklist.General.User_Removed_Success.formater({'USER': targetname}), user);
            return true;
        }
        else {
            _Botuser.sendPrivateMessage(_LNG.Blacklist.Error.User_Not_Yet_Blacklisted.formater({'USER': targetname}), user);
            return true;
        }

        return false;

    },

    /**
     * Gets comma seprate list of blacklisted users
     *
     * @returns {string}
     */
    getBlacklist: function () {

        let list = '';

        for (let i = 0; i < _CFG.Blacklist.userIDs.length; i++) {
            let name = _User.getNick(_CFG.Blacklist.userIDs[i]);
            if (i + 1 === _CFG.Blacklist.userIDs.length) {
                list += name;
            }
            else {
                list += name + ', ';
            }
        }

        return list;

    },

};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MBlacklist = function (action) {

    if (action === 'start') {
        MBlacklist.preload();
    }

};

/**
 * Adds Command .blacklist
 *
 * @param user
 * @param cmd
 * @param params
 */
ChatCommands.blacklist = function (user, cmd, params) {

    if (!MBlacklist.allowed(user)) {
        _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
        return;
    }

    if (isEmpty(params)) {
        let list = MBlacklist.getBlacklist();
        _Botuser.sendPrivateMessage(_LNG.Blacklist.General.Blacklist_Prefix + list, user);
        return;
    }

    if (params.charAt(0) === '!') {
        params = params.replace(/!/, '');
        if (!MBlacklist.removeUserByName(user, params)) {
            MBlacklist.help(user);
            return;
        }
        return;
    }

    MBlacklist.addUserByName(user, params);

};

App.chatCommands['.blacklist'] = function (user, params, cmd) {
    ChatCommands.blacklist(user, cmd, params);
};

/**
 * ACP UI
 *
 * @type {{type: string, content: AppContent}}
 */
MACP.UI.blacklist = {
    type: 'popup',
    content: AppContent.popupContent(new HTMLFile('/acp/cfg_blacklist.html'), 650, 420)
};

/**
 * Gets ACP UI Datas
 *
 * @returns {{IsActive: boolean}}
 */
MACP.ACPUIDatas.blacklist = function () {

    let dataObject = {
        'IsActive': _CFG.Blacklist.IsActive,
    };

    return dataObject;

};