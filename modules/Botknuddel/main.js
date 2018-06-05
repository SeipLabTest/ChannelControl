/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 21.03.2018
 * @version: 1.0.2
 * @app: ChannelControl 3
 * @module: Botknuddel (extends: module Bot)
 */

let MBotKnuddel = {

    /**
     * Is called by System Cronjob
     */
    intvall: function () {

        if (_CFG.Botknuddel.LastIntervall + (_CFG.Botknuddel.Intervall * 1000 * 60) < Date.now()
            && _CFG.Botknuddel.IsActive && _Channel.getOnlineUsers(UserType.Human).length >= _CFG.Botknuddel.MinUsers
        ) {
            this.doKnuddel();
            _CFG.Botknuddel.LastIntervall = Date.now();
        }

    },

    /**
     * Checks if payout is allowed
     *
     * @returns {boolean}
     */
    isPayoutAllowed: function () {

        return (_CFG.Botknuddel.MinKnuddel > 0.00 && _CFG.Botknuddel.MaxKnuddel > _CFG.Botknuddel.MinKnuddel
            && _AppInstance.getAppInfo().getMaxPayoutKnuddelAmount().asNumber() > _CFG.Botknuddel.MaxKnuddel);

    },

    /**
     * Does knuddel a random user in channel
     */
    doKnuddel: function () {

        if (!this.isPayoutAllowed()) {
            _Logger.info('Es konnte kein zufälliges Knuddeln ausgeführt werden.');
            return;
        }

        let i = getRandomNumber(0, _Channel.getOnlineUsers(UserType.Human).length - 1);
        let target = _Channel.getOnlineUsers(UserType.Human)[i];
        let targetObj = _User.getUserById(_User.getUserId(target));
        let amount = getRandomDecimalNumber(_CFG.Botknuddel.MinKnuddel, _CFG.Botknuddel.MaxKnuddel);

        let transferOptions = {
            transferDisplayType: KnuddelTransferDisplayType.Public,
            onSuccess: function () {
                _Logger.info(targetObj.getNick() + ' geknuddelt');
            },
            onError: function (logMsg) {
                _Logger.info(targetObj.getNick() + ' konnte nicht geknuddelt werden.', logMsg);
            }
        };

        _Botuser.transferKnuddel(targetObj, amount, transferOptions);

    }

};

/**
 * Extends Module Bot
 *
 * @param user
 */
ChatCommands.knuddel = function (user, cmd, params) {

    if (!user.isChannelOwner() && !user.isAppManager()) {
        _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
        return false;
    }

    _Logger.info(user.getNick() + ' führt Befehl .knuddel aus.');
    MBotKnuddel.doKnuddel();

};


App.chatCommands['.knuddel'] = function (user, params, cmd) {
    ChatCommands.knuddel(user, cmd, params);
};

/**
 * Extends System Cronjob
 *
 * @constructor
 */
Cronjob.MBotknuddel = function () {
    MBotKnuddel.intvall();
};

/**
 * ACP UI
 *
 * @type {{type: string, content: AppContent}}
 */
MACP.UI.botknuddel = {
    type: 'popup',
    content: AppContent.popupContent(new HTMLFile('/acp/cfg_botknuddel.html'), 650, 420)
};

/**
 * ACP UI Datas
 *
 * @returns {*|{IsActive: boolean, Intervall: number, LastIntervall: number, MinKnuddel: number, MaxKnuddel: number, MinUsers: number}|Botknuddel|{IsActive, Intervall, LastIntervall, MinKnuddel, MaxKnuddel, MinUsers}}
 */
MACP.ACPUIDatas.botknuddel = function () {

    return _CFG.Botknuddel;

};

/**
 * Checks new config and saves them
 *
 * @param user
 * @param datas
 * @constructor
 */
MACP.ConfigCheck.Botknuddel = function (user, datas) {

    if (!isNaN(datas.Intervall)) {
        datas.Intervall = parseFloat(datas.Intervall);
        if (datas.Intervall >= 1.00) {
            _CFG.Botknuddel.Intervall = datas.Intervall;
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

    if (!isNaN(datas.MinUsers)) {
        datas.MinUsers = parseInt(datas.MinUsers);
        if (datas.MinUsers >= 1) {
            _CFG.Botknuddel.MinUsers = datas.MinUsers;
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.System.Error.Number_Is_Too_Small.formater({'KEY': 'Min. User', 'INT': '1'})
            });
            return;
        }
    }
    else {
        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': _LNG.System.Error.Is_NaN + ' (Min. User)'
        });
        return;
    }

    if (!isNaN(datas.MinKnuddel)) {
        datas.MinKnuddel = parseFloat(datas.MinKnuddel);
        if (datas.MinKnuddel >= 0.01) {
            _CFG.Botknuddel.MinKnuddel = datas.MinKnuddel;
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.System.Error.Number_Is_Too_Small.formater({'KEY': 'Min. Knuddel', 'INT': '0.01'})
            });
            return;
        }
    }
    else {
        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': _LNG.System.Error.Is_NaN + ' (Min. Knuddel)'
        });
        return;
    }

    if (!isNaN(datas.MaxKnuddel)) {
        datas.MaxKnuddel = parseFloat(datas.MaxKnuddel);
        if (datas.MaxKnuddel >= 0.02) {
            _CFG.Botknuddel.MaxKnuddel = datas.MaxKnuddel;
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.System.Error.Number_Is_Too_Small.formater({'KEY': 'Max. Knuddel', 'INT': '0.02'})
            });
            return;
        }
    }
    else {
        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': _LNG.System.Error.Is_NaN + ' (Min. Knuddel)'
        });
        return;
    }

    user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
        'msg': _LNG.System.General.Setings_Changed
    });

    CORE.reloadConfig();
    MACP.getUIDatas(user, datas.page);

};