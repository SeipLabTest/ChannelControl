/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 07.10.2017
 * @version: 1.0.0
 * @app: ChannelControl 3
 * @module: Bot
 */

let MBot = {

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
                '.bot do:TEXT - der Bot tut TEXT',
                '.bot say:TEXT - der Bot sagt TEXT',
                '.bot mute - den Bot ruhig stellen'
            ],
        ];
        CORE.registerLanguages('Bot', 'Help', langs);

        // Register Error Messages
        langs['keys'] = [
            'NoRights'
        ];
        langs['items'] = [
            'Du hast nicht die nötigen Rechte um diese Funktion aufzurufen.',
        ];
        CORE.registerLanguages('Bot', 'Error', langs);

        // Register General Messages
        langs['keys'] = [
            'CMD_Bot_Was_Muted',
            'CMD_Bot_Was_Unmuted',
        ];
        langs['items'] = [
            'ist nun still.',
            'ist wieder da!'
        ];
        CORE.registerLanguages('Bot', 'General', langs);

    },

    /**
     * Check if user is allowed to use this command
     *
     * @param user
     * @returns {boolean}
     */
    allowed: function (user) {

        return !(!user.isEventModerator() && !user.isAppManager() && !user.isChannelOwner());

    },

    /**
     * Sends help message to user
     *
     * @param user
     */
    help: function (user) {

        let msg = _LNG.Bot.Help.Usage;

        _LNG.Bot.Help.UsageCMDs.forEach(function (item) {
            msg += item + '°#°';
        });

        _Botuser.sendPrivateMessage(msg, user);

    },

    /**
     * Sends action message as bot user
     *
     * @param user
     * @param msg
     */
    do: function (user, msg) {

        // Check if do message is empty
        if (isEmpty(msg)) {
            this.help(user);
            return;
        }

        // Logging function usage
        _Logger.info(user.getNick() + ' nutzt .bot do:' + msg);

        // escape KCode
        msg = msg.escapeKCode();

        _Botuser.sendPublicActionMessage(msg);

    },

    /**
     * Sends public message as bot user
     *
     * @param user
     * @param msg
     */
    say: function (user, msg) {

        // Check if say message is empty
        if (isEmpty(msg)) {
            this.help(user);
            return;
        }

        // Escape KCode
        msg = msg.escapeKCode();

        // Logging function usage
        _Logger.info(user.getNick() + ' nutzt .bot say:' + msg);

        // If bot is in event mode we add collor and size
        if (_CFG.Bot.IsEventMode) {
            msg = '°BB°°20°' + msg;
        }

        _Botuser.sendPublicMessage(msg);

    },

    /**
     * Switch config Bot.IsMuted temporary
     *
     * @param user
     */
    mute: function (user) {

        let msg, status;

        // Switch status of Bot.IsMuted
        if (_CFG.Bot.IsMuted) {
            status = false;
            msg = _LNG.Bot.General.CMD_Bot_Was_Muted;
        }

        // Switch status of Bot.IsMuted
        if (!_CFG.Bot.IsMuted) {
            status = true;
            msg = _LNG.Bot.General.CMD_Bot_Was_Unmuted;
        }

        // Logging function usage
        _Logger.info(user.getNick() + ' nutzt .bot mute');

        // Change temporally Bot.IsMuted status
        _CFG.Bot.IsMuted = status;

        _Botuser.sendPublicActionMessage(msg);

    }

};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MBot = function (action) {

    if (action !== 'start') {
        return;
    }

    MBot.preload();

};

/**
 * Extends System ChatCommands
 *
 * @param user
 * @param cmd
 * @param params
 */
ChatCommands.bot = function (user, cmd, params) {

    // Check if user is allowed to use this command
    if (!MBot.allowed(user)) {
        _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
        return;
    }

    // If we have'nt any  params wie set it to help
    if (isEmpty(params)) {
        params = 'help';
    }

    params = params.split(':');

    if (!(params[0].toLowerCase() in MBot)) {
        params[0] = 'help';
    }

    // merge splitted message
    params[1] = mergeSplitString(params, 2, ':');

    // Call needed method
    MBot[params[0].toLowerCase()](user, params[1]);

};

App.chatCommands['.bot'] = function (user, params, cmd) {
    ChatCommands.bot(user, cmd, params);
};

/**
 * ACP UI
 *
 * @type {{type: string, content: AppContent}}
 */
MACP.UI.bot = {
    type: 'popup',
    content: AppContent.popupContent(new HTMLFile('/acp/cfg_bot.html'), 650, 420)
};

/**
 * ACP UI Datas
 *
 * @returns {*|{IsMuted: boolean, IsEventMode: boolean}|Bot|{IsMuted, IsEventMode}}
 */
MACP.ACPUIDatas.bot = function () {

    return _CFG.Bot;

};

/**
 * Checks new config and saves them
 *
 * @param user
 * @param datas
 * @constructor
 */
MACP.ConfigCheck.Bot = function (user, datas) {

    if ('ismuted' in datas) {
        _CFG.Bot.IsMuted = !_CFG.Bot.IsMuted;
    }
    else if ('iseventmode' in datas) {
        _CFG.Bot.IsEventMode = !_CFG.Bot.IsEventMode;
    }
    else {
        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': _LNG.System.Error.Change_Settings
        });
        return;
    }

    user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
        'msg': _LNG.System.General.Setings_Changed
    });

    CORE.reloadConfig();
    MACP.getUIDatas(user, datas.page);

};