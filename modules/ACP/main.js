/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 25.03.2018
 * @version: 1.2.0
 * @app: ChannelControl 3
 * @module: ACP
 */

/**
 *
 * @type {{allowed: MACP.allowed, UI: {index: {type: string, content: AppContent}}, getUI: MACP.getUI, ACPUIDatas: {index: MACP.ACPUIDatas.index}, getUIDatas: MACP.getUIDatas, switchModule: MACP.switchModule, ConfigCheck: {}, setModuleConfig: MACP.setModuleConfig, sendNotice: MACP.sendNotice}}
 */
let MACP = {

    /**
     * Check if user is allowed to use this command
     *
     * @param user
     * @returns {Boolean}
     */
    allowed: function (user) {

        return user.isChannelOwner() || user.isAppManager() || AUser.isCCTeam(user);

    },

    /**
     * Contains every ACP-UI Information
     */
    UI: {
        index: {
            type: 'popup',
            content: AppContent.popupContent(new HTMLFile('/acp/index.html'), 650, 420)
        },
    },

    /**
     * Gets the specific content from MACP.UI if exist
     *
     * @param user
     * @param content
     */
    getUI: function (user, content) {

        if (content in this.UI) {
            let uiDatas = this.UI[content];
            if (user.canSendAppContent(uiDatas.content)) {
                user.sendAppContent(uiDatas.content);
                MACP.getUIDatas(user, content);
            }
            else {
                _Botuser.sendPrivateMessage(_LNG.System.Error.UI_Device_Problems, user);
            }
        }
        else {
            _Botuser.sendPrivateMessage(_LNG.System.Error.Modul_Doesnt_Exist, user);
        }

    },

    /**
     * Contains every method to get the right UI Datas.
     */
    ACPUIDatas: {
        index: function () {
            let dataObject = {
                'Version': _CFG.General.Version + ' ' + _CFG.General.Access,
                'InstallDate': timestampToDate(_CFG.General.InstallDate, 0),
                'Users': TOTAL_USERS,
                'Knuddel': _AppInstance.getAppInfo().getMaxPayoutKnuddelAmount().asNumber(),
                'Profit': _CFG.General.Profit,
                'LastRestart': timestampToDate(knuddelstimeToTimestamp(_AppInstance.getStartDate()), 0),
                'LastUpdate': timestampToDate(_CFG.General.LastUpdate, 0),
                'Modules': {
                    'Advertise': _CFG.Advertise.IsActive,
                    'Activity': _CFG.TopList.Activity.IsActive,
                    'Blacklist': _CFG.Blacklist.IsActive,
                    'Bot': !_CFG.Bot.IsMuted,
                    'Botgreeting': _CFG.BotGreeting.IsActive,
                    'Botknuddel': _CFG.Botknuddel.IsActive,
                    'GreedyPig': _CFG.Greedy.IsActive,
                    'CMElection': _CFG.Election.IsActive,
                    'LoginBonus': _CFG.LoginBonus.IsActive,
                    'MuteNotify': _CFG.MuteNotify.IsActive,
                    'Nutshell': _CFG.Nutshell.IsActive,
                    'ReadmeRaffle': _CFG.ReadmeRaffle.IsActive,
                    'StatusIcons': _CFG.StatusIcons.IsActive
                },
            };
            if (_CFG.General.Access === 'Lite') {
                dataObject.Version += ' <small>(<a href="#" onclick="Client.sendEvent(\'Upgrade\', {})">Upgrade</a>)</small>';
            }
            return dataObject;
        }
    },

    /**
     * Gets UI Datas from MACP.ACPUIDatas
     *
     * @param user
     * @param content
     */
    getUIDatas: function (user, content) {

        if (content in this.ACPUIDatas) {
            if (user.getAppContentSession(AppViewMode.Popup)) {
                user.getAppContentSession(AppViewMode.Popup).sendEvent(content, this.ACPUIDatas[content]());
            }
        }

    },

    /**
     * Switch module config (IsActive)
     *
     * @param user
     * @param module
     * @param sub
     * @param page
     * @returns {boolean}
     */
    switchModule: function (user, module, sub, page) {
        if (!user.isChannelOwner() && !user.isAppManager() && !AUser.isCCTeam(user)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
            return false;
        }

        if (!(sub in _CFG[module])) {
            sub = 'e';
        }

        if (sub === 'e') {
            _CFG[module]['IsActive'] = !_CFG[module]['IsActive'];
        }
        else {
            _CFG[module][sub]['IsActive'] = !_CFG[module][sub]['IsActive'];
        }

        CORE.reloadConfig();
        this.getUIDatas(user, page);
        this.sendNotice(user, true);
        return true;
    },

    /**
     * Contains modul specific config methods
     */
    ConfigCheck: {},

    /**
     * @param user
     * @param datas
     */
    setModuleConfig: function (user, datas) {

        if (!this.allowed(user)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
            return;
        }

        if (!datas.module in this.ConfigCheck) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.Unexpected_Error, user);
            return;
        }

        this.ConfigCheck[datas.module](user, datas);
    },

    /**
     * Sends a success/error message to users ui window
     *
     * @param user
     * @param succs
     */
    sendNotice: function (user, succs) {

        let msg = '';
        if (succs) {
            msg = 'Änderungen gespeichert!';
        }
        else {
            msg = 'Diese Änderungen konnten nicht gespeichert werden.';
        }

        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': msg
        });

    }

};

/**
 * Opens specific ACP UI
 *
 * @param user
 * @param cmd
 * @param params
 */
ChatCommands.acp = function (user, cmd, params) {

    if (!MACP.allowed(user)) {
        _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
        return;
    }

    if (isEmpty(params)) {
        params = 'index';
    }

    MACP.getUI(user, params);

};

App.chatCommands['.acp'] = function (user, params, cmd) {
    ChatCommands.acp(user, cmd, params);
};