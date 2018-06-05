/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 17.04.2018
 * @version: 1.1.0
 * @app: ChannelControl 3
 * @module: Readme Raffle
 */

let MReadmeRaffle = {

    preload: function () {

        if (!('ReadmeRaffle' in _CFG)) {
            _CFG.ReadmeRaffle = {
                'IsActive': false,
                'Intervall': 24,
                'LastIntervall': Date.now(),
                'MaxWinner': -1,
                'KnuddelPerWinner': 1,
                'KeyText': 'Besucht ' + _Channel.getChannelName(),
                'MinStatus': 1,
            };
            CORE.reloadConfig();
        }

        let langs = ['keys', 'items'];

        // Register General Messages
        langs['keys'] = [
            'Winner_Transfer_Reason',
        ];
        langs['items'] = [
            'Gewinn bei der Readme-Verlosung!'
        ];
        CORE.registerLanguages('ReadmeRaffle', 'General', langs);

    },

    intvall: function () {

        if (_CFG.ReadmeRaffle.IsActive && _CFG.ReadmeRaffle.LastIntervall + (_CFG.ReadmeRaffle.Intervall * 60 * 60 * 1000) < Date.now()) {
            _CFG.ReadmeRaffle.LastIntervall = Date.now();
            this.getCompetitors();
        }

    },

    getCompetitors: function () {

        let users = [];
        let userstatus = [UserStatus.Newbie, UserStatus.Family, UserStatus.Stammi, UserStatus.HonoryMember];

        let parameters = {
            onStart: function (accessibleUserCount) {
            },
            onEnd: function (accessibleUserCount) {
                MReadmeRaffle.getWinningUsers(users);
            }

        };

        _User.eachAccessibleUser(function (user, index, accessibleUserCount) {

            if (!AUser.isExisting(user)) {
                return;
            }

            if (_CFG.ReadmeRaffle.MinStatus === 4) {
                if (!user.isLikingChannel()) {
                    return;
                }
            }
            else {
                if (!user.getUserStatus().isAtLeast(userstatus[_CFG.ReadmeRaffle.MinStatus])) {
                    return;
                }
            }

            if (user.getReadme().stripKCode() !== _CFG.ReadmeRaffle.KeyText) {
                return;
            }

            users.push(user);

        }, parameters);

    },

    getWinningUsers: function (users) {

        let winner = [];
        let winners = [];
        let max = _CFG.ReadmeRaffle.MaxWinner;

        if (isEmpty(users)) {
            _Logger.info('Readme Verlosung abgebrochen: Keine Teilnehmer.');
            return;
        }

        if (_CFG.ReadmeRaffle.MaxWinner === 0) {
            _Logger.info('Readme Verlosung abgebrochen: Max. Gewinner ist null.');
            return;
        }

        if (_CFG.ReadmeRaffle.MaxWinner > 0) {
            if (max > users.length) {
                max = users.length;
            }
            if (max > 1) {
                for (let i = 0; i < max; i++) {
                    let target = users[getRandomNumber(0, users.length - 1)];
                    if (winner.indexOf(target.getNick()) !== -1) {
                        while (winner.indexOf(target.getNick()) !== -1) {
                            target = users[getRandomNumber(0, users.length - 1)];
                        }
                    }
                    winner.push(target.getNick());
                }
            }
            else {
                let target = users[getRandomNumber(0, users.length - 1)];
                winner.push(target.getNick());
            }
            winner.forEach(function (item) {
                winners.push(_User.getUserById(_User.getUserId(item)));
            });
        }


        if (_CFG.ReadmeRaffle.MaxWinner === -1) {
            winners = users;
        }

        this.payoutWinningUsers(winners);

    },

    payoutWinningUsers: function (users) {

        users.forEach(function (user) {
            if (_AppInstance.getAppInfo().getMaxPayoutKnuddelAmount().asNumber() > _CFG.ReadmeRaffle.KnuddelPerWinner) {
                _Botuser.transferKnuddel(user.getKnuddelAccount(), new KnuddelAmount(_CFG.ReadmeRaffle.KnuddelPerWinner), {
                    'displayReasonText': _LNG.ReadmeRaffle.General.Winner_Transfer_Reason,
                    'transferDisplayType': KnuddelTransferDisplayType.Private,
                });
            }
            else {
                _Logger.info('Readme-Verlosung: ' + user.getNick() + ' konnte nicht ausgezahlt werden!')
            }
        });

    },

};

OnStartStop.MReadmeRaffle = function (action) {

    if (action === 'start') {
        MReadmeRaffle.preload();
    }

};

Cronjob.MReadmeRaffle = function () {
    if (_CFG.General.Access !== 'Lite') {
        MReadmeRaffle.intvall();
    }
};

/**
 * ACP UI
 *
 * @type {{type: string, content: AppContent}}
 */
MACP.UI.readmeraffle = {
    type: 'popup',
    content: AppContent.popupContent(new HTMLFile('/acp/cfg_readmeraffle.html'), 650, 420)
};

/**
 * ACP UI Datas
 *
 * @returns {{IsActive: boolean, LastIntervall: number, MaxWinner: number, KnuddelPerWinner: number, KeyText: string, MinStatus: number}|*}
 */
MACP.ACPUIDatas.readmeraffle = function () {

    return _CFG.ReadmeRaffle;

};

/**
 * Checks new config and saves them
 *
 * @param user
 * @param datas
 * @constructor
 */
MACP.ConfigCheck.ReadmeRaffle = function (user, datas) {

    if (!isNaN(datas.Intervall)) {
        datas.Intervall = parseFloat(datas.Intervall);
        if (datas.Intervall >= 1.00) {
            _CFG.ReadmeRaffle.Intervall = datas.Intervall;
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

    if (!isNaN(datas.MaxWinner)) {
        datas.MaxWinner = parseInt(datas.MaxWinner);
        if (datas.MaxWinner >= -1) {
            _CFG.ReadmeRaffle.MaxWinner = datas.MaxWinner;
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.System.Error.Number_Is_Too_Small.formater({'KEY': 'Max. Winner', 'INT': '-1'})
            });
            return;
        }
    }
    else {
        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': _LNG.System.Error.Is_NaN + ' (Max. Winner)'
        });
        return;
    }

    if (!isNaN(datas.KnuddelPerWinner)) {
        datas.KnuddelPerWinner = parseInt(datas.KnuddelPerWinner);
        if (datas.KnuddelPerWinner > 0) {
            _CFG.ReadmeRaffle.KnuddelPerWinner = datas.KnuddelPerWinner;
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.System.Error.Number_Is_Too_Small.formater({'KEY': 'Knuddel p. Gewinner', 'INT': '1'})
            });
            return;
        }
    }
    else {
        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': _LNG.System.Error.Is_NaN + ' (Knuddel p. Gewinner)'
        });
        return;
    }

    if (!isNaN(datas.MinStatus)) {
        datas.MinStatus = parseInt(datas.MinStatus);
        if (datas.MinStatus >= 0 && datas.MinStatus <= 11) {
            _CFG.ReadmeRaffle.MinStatus = datas.MinStatus;
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

    _CFG.ReadmeRaffle.KeyText = getEscapedString(datas.KeyText);

    user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
        'msg': _LNG.System.General.Setings_Changed
    });

    CORE.reloadConfig();
    MACP.getUIDatas(user, datas.page);

};