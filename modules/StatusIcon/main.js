/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 18.03.2018
 * @version: 1.1.1
 * @app: ChannelControl 3
 * @module: StatusIcon
 */

let MStatusIcon = {

    /**
     * Get status icon params
     *
     * @param user
     * @returns {{path: string, width: number}}
     */
    getStatusIcon: function (user) {

        // Predefine icon var
        let icon = {
            'path': 'none',
            'width': 0,
        };

        // Get icon for LMC users
        if (user.isLikingChannel() && _CFG.StatusIcons.IsLMCIconActive) {
            icon.path = _CFG.StatusIcons.LMC;
            icon.width = 23;
        }

        // Get icon for owners
        if (user.isChannelOwner() && _CFG.StatusIcons.IsOwnerIconActive) {
            icon.path = _CFG.StatusIcons.Owner;
            icon.width = 40;
        }

        return icon;

    },

    /**
     * set user status icon
     *
     * @param user
     */
    setStatusIcon: function (user) {

        // Check if module is active
        if (!_CFG.StatusIcons.IsActive && !user.isAppDeveloper()) {
            return;
        }

        let icon = this.getStatusIcon(user);

        // Check if we have a status icon
        if (icon.path === 'none') {
            return;
        }

        user.addNicklistIcon(icon.path, icon.width);

    },

    /**
     * Set all status icons
     */
    setStatusIcons: function () {

        // Get all channel user
        let users = _Channel.getOnlineUsers(UserType.Human);

        if (users.length < 1) {
            return;
        }

        // set icon for every user in channel
        for (let i = 0; i < users.length; i++) {
            var target = _User.getUserById(_User.getUserId(users[i]));
            this.removeStatusIcon(target);
            this.setStatusIcon(target);
        }

    },

    /**
     * Remove users status icon
     *
     * @param user
     */
    removeStatusIcon: function (user) {

        let icon = this.getStatusIcon(user);

        if (icon.path === 'none') {
            return;
        }

        user.removeNicklistIcon(icon.path);

    }

};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MStatusIcon = function (action) {

    if (action !== 'start') {
        return;
    }

    MStatusIcon.setStatusIcons();

};

/**
 * Extends System OnJoinLeft
 *
 * @param user
 * @param action
 * @constructor
 */
OnJoinLeft.MStatusIcon = function (user, action) {

    if (action !== 'join') {
        return;
    }

    MStatusIcon.setStatusIcon(user);

};

MACP.UI.statusicons = {
    type: 'popup',
    content: AppContent.popupContent(new HTMLFile('/acp/cfg_statusicons.html'), 650, 420)
};

MACP.ACPUIDatas.statusicons = function () {

    let dataObject = {
        'IsActive': _CFG.StatusIcons.IsActive,
        'IsLMCIconActive': _CFG.StatusIcons.IsLMCIconActive,
        'IsOwnerIconActive': _CFG.StatusIcons.IsOwnerIconActive,
    };
    return dataObject;

};

MACP.ConfigCheck.StatusIcons = function (user, datas) {

    if ('IsOwnerIconActive' in datas) {
        _CFG.StatusIcons.IsOwnerIconActive = !_CFG.StatusIcons.IsOwnerIconActive;
    }
    else if ('IsLMCIconActive' in datas) {
        _CFG.StatusIcons.IsLMCIconActive = !_CFG.StatusIcons.IsLMCIconActive;
    }

    user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
        'msg': _LNG.System.General.Setings_Changed
    });

    CORE.reloadConfig();
    MACP.getUIDatas(user, datas.page);

};
