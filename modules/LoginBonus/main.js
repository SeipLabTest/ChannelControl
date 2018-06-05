/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 18.04.2018
 * @version: 1.1.0
 * @app: ChannelControl 3
 * @module: LoginBonus
 */

let MLoginBonus = {

    /**
     * Preload configs / languages
     */
    preload: function () {

        let langs = ['keys', 'items'];

        // Register Error Messages
        langs['keys'] = [
            'Not_Enough_Knuddel',
        ];
        langs['items'] = [
            'Auszahlung für Login-Bonus nicht möglich. (Nicht genug Knuddel)',
        ];
        CORE.registerLanguages('LoginBonus', 'Error', langs);

        // Register General Messages
        langs['keys'] = [
            'Transfer_Reason',
        ];
        langs['items'] = [
            'Deine Tagesbelohnung! ($COUNTx)',
        ];
        CORE.registerLanguages('LoginBonus', 'General', langs);

    },

    /**
     * Check if this is a bonus login
     *
     * @param user
     * @returns {boolean}
     */
    isBonusLogin: function (user) {

        let userDatas = AUser.getUserDatas(user);

        if (_CFG.LoginBonus.UserMinStatus === 4) {
            if (!user.isLikingChannel()) {
                return false;
            }
        }
        else {
            if (user.getUserStatus().getNumericStatus() < _CFG.LoginBonus.UserMinStatus) {
                return false;
            }
        }

        if (userDatas.LastLoginTime + (_CFG.LoginBonus.Intervall * 60 * 1000) >= Date.now()) {
            return false;
        }

        return userDatas.LoginCount.LastRow + (24 * 60 * 60 * 1000) <= Date.now();

    },

    /**
     * Gets the correct bonus multiplier
     *
     * @param user
     * @returns {number}
     */
    getBonusMultiplier: function (user) {

        let userDatas = AUser.getUserDatas(user);

        let diff = Date.now() - userDatas.LoginCount.LastRow;
        diff = diff / (60 * 60 * 1000);

        let multiplier = 1;

        if (diff < 48) {
            multiplier += userDatas.LoginCount.InRow;
        }

        return multiplier;

    },

    /**
     * Saves new login bonus datas
     *
     * @param user
     * @param multiplier
     */
    setUserDatas: function (user, multiplier) {

        let userDatas = AUser.getUserDatas(user);
        let now = new Date();
        let date = now.getDate() + '.' + (now.getMonth() + 1) + '.' + now.getFullYear();

        userDatas.LoginCount.LastRow = dateToTimestamp(date);
        userDatas.LoginCount.InRow = multiplier === _CFG.LoginBonus.MaxMultiply ? 0 : multiplier;

        user.getPersistence().setObject('User', userDatas);

    },

    /**
     * Gives bonus to user
     *
     * @param user
     */
    giveBonus: function (user) {

        let multiplier = this.getBonusMultiplier(user);
        let value = _CFG.LoginBonus.BaseValue * multiplier;
        let reason = _LNG.LoginBonus.General.Transfer_Reason.formater({'COUNT': multiplier});
        let knuddelAmount = new KnuddelAmount(value);

        if (_AppInstance.getAppInfo().getMaxPayoutKnuddelAmount().asNumber() > knuddelAmount.asNumber()) {
            _Botuser.transferKnuddel(user.getKnuddelAccount(), knuddelAmount, {
                'displayReasonText': reason,
                'transferDisplayType': KnuddelTransferDisplayType.Public,
            });
        }
        else {
            _Logger.info(_LNG.LoginBonus.Error.Not_Enough_Knuddel);
        }

        this.setUserDatas(user, multiplier);

    },

};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MLoginBonus = function (action) {

    if (action === 'start') {
        MLoginBonus.preload();
    }

};

/**
 * Extends System Cronjob
 *
 * @constructor
 */
Cronjob.MLoginBonus = function () {

    if (_CFG.General.Access === 'Lite' || !_CFG.LoginBonus.IsActive) {
        return;
    }

    _CFG.LoginBonus.LastIntervall = Date.now();

    let user = _Channel.getOnlineUsers(UserType.Human);

    if (user.length === 0) {
        return;
    }

    for (let i = 0; i < user.length; i++) {

        if (MLoginBonus.isBonusLogin(user[i])) {
            MLoginBonus.giveBonus(user[i]);
        }

    }

};

MACP.UI.loginbonus = {
    type: 'popup',
    content: AppContent.popupContent(new HTMLFile('/acp/cfg_loginbonus.html'), 650, 420)
};

MACP.ACPUIDatas.loginbonus = function () {

    let dataObject = {
        'IsActive': _CFG.LoginBonus.IsActive,
        'Intervall': _CFG.LoginBonus.Intervall,
        'UserMinStatus': _CFG.LoginBonus.UserMinStatus,
        'BaseValue': _CFG.LoginBonus.BaseValue,
        'MaxMultiply': _CFG.LoginBonus.MaxMultiply,
    };
    return dataObject;

};

MACP.ConfigCheck.LoginBonus = function (user, datas) {

    if (!isNaN(datas.UserMinStatus)) {
        datas.UserMinStatus = parseInt(datas.UserMinStatus);
        if (datas.UserMinStatus >= 0 && datas.UserMinStatus <= 11) {
            _CFG.LoginBonus.UserMinStatus = datas.UserMinStatus;
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.System.Error.Number_Is_Too_Small.formater({'KEY': 'Min. Status', 'INT': '0'})
            });
            return;
        }
    }
    else {
        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': _LNG.System.Error.Is_NaN + ' (Min. Status)'
        });
        return;
    }

    if (!isNaN(datas.Intervall)) {
        datas.Intervall = parseFloat(datas.Intervall);
        if (datas.Intervall >= 1.00) {
            _CFG.LoginBonus.Intervall = datas.Intervall;
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.System.Error.Number_Is_Too_Small.formater({'KEY': 'Intervall', 'INT': '1.00'})
            });
            return;
        }
    }
    else {
        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': _LNG.System.Error.Is_NaN + ' (Intervall)'
        });
        return;
    }

    if (!isNaN(datas.MaxMultiply)) {
        datas.MaxMultiply = parseInt(datas.MaxMultiply);
        if (datas.MaxMultiply >= 0) {
            _CFG.LoginBonus.MaxMultiply = datas.MaxMultiply;
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.System.Error.Number_Is_Too_Small.formater({'KEY': 'Max. Multiplikator', 'INT': '0'})
            });
            return;
        }
    }
    else {
        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': _LNG.System.Error.Is_NaN + ' (Max. Multiplikator)'
        });
        return;
    }

    if (!isNaN(datas.BaseValue)) {
        datas.BaseValue = parseFloat(datas.BaseValue);
        if (datas.BaseValue >= 0.01 && datas.BaseValue <= 5) {
            _CFG.LoginBonus.BaseValue = datas.BaseValue;
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.System.Error.Number_Is_Too_Small.formater({'KEY': 'Startwert', 'INT': '0.01'})
            });
            return;
        }
    }
    else {
        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': _LNG.System.Error.Is_NaN + ' (Startwert)'
        });
        return;
    }

    user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
        'msg': _LNG.System.General.Setings_Changed
    });

    CORE.reloadConfig();
    MACP.getUIDatas(user, datas.page);

};