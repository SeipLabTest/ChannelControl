/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 14.04.2018
 * @version: 1.4.0
 * @app: ChannelControl 3
 * @system: ChatCommands
 */

let ChatCommands = {

    system: function (user, cmd, params) {

        let msg = '_System-Informationen_°#°';
        msg += '_Name:_ ' + _AppInstance.getAppInfo().getAppName() + '°#°';
        msg += '_Version:_ ' + _AppInstance.getAppInfo().getAppVersion() + ' ' + _CFG.General.Access + '°#°';
        msg += '_Entwickler:_ ' + _AppInstance.getAppInfo().getAppDeveloper().getProfileLink() + '°#°';
        msg += '_AppID:_ ' + _AppInstance.getAppInfo().getAppId() + '°#°';
        msg += '_Installation:_ ' + new Date(_CFG.General.InstallDate) + '°#°';

        if (user.isChannelOwner() || user.isAppManager() || user.isAppDeveloper()) {
            msg += '°#°Hinweis: Die folgenden Infos sehen nur AppManager!°#°';
            msg += '_Verfügbare Knuddel:_ ' + _AppInstance.getAppInfo().getMaxPayoutKnuddelAmount().asNumber() + '°#°';
            msg += '_Letzter Neustart:_ ' + _AppInstance.getStartDate() + '°#°';
            msg += '_Letztes Update:_ ' + new Date(_CFG.General.LastUpdate);
        }

        _Botuser.sendPrivateMessage(msg, user);

    },

    help: function (user, cmd, params) {

        let contentDatas = {
            type: 'popup',
            content: AppContent.popupContent(new HTMLFile('/help.html'), 650, 420),
        };

        if (user.canSendAppContent(contentDatas.content)) {
            user.sendAppContent(contentDatas.content);
        }
        else {
            _Botuser.sendPrivateMessage(_LNG.System.Error.UI_Device_Problems, user);
        }

    },

    donate: function (user, cmd, params) {

        if (isEmpty(params)) {
            _Botuser.sendPrivateMessage('Bitte die Funktion folgendermaßen verwenden:°#°.donate ANZAHL - um ANZAHL Knuddel zu spenden', user);
            return;
        }

        if (isNaN(params)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.Is_NaN, user);
            return;
        }

        params = parseFloat(params);

        if (params < 0.01) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.Invalid_Input, user);
            return;
        }

        let knAmount = new KnuddelAmount(params);

        if (!user.getKnuddelAccount().hasEnough(knAmount)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.Not_Enough_Knuddel.formater({'AMOUNT': Math.round(knAmount.asNumber())}), user);
            return;
        }

        user.getKnuddelAccount().use(knAmount, 'Vielen Dank! (Spende)', {
            'onError': function () {
                _Botuser.sendPrivateMessage(_LNG.System.Error.Unexpected_Error, user);
                return;
            },
            'onSuccess': function () {
                _Botuser.sendPublicActionMessage('freut sich, über die knuddelige Spende von ' + user.getNick() + '.');
            }
        });

    },

    payout: function (user, cmd, params) {

        if (!user.isChannelOwner()) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
            return;
        }

        if (isEmpty(params)) {
            _Botuser.sendPrivateMessage('Bitte die Funktion folgendermaßen verwenden:°#°.payout ANZAHL - um ANZAHL Knuddel auszuzahlen.°#°.payout ANZAHL:NICK:GRUND - um ANZAHL Knuddel an NICK auszuzahlen.', user);
            return;
        }

        let target = user;
        let amount = 0;
        let nick = '';
        let reason = 'Auszahlung';

        if (params.contains(':')) {
            params = params.split(':');
            amount = params[0];
            if (params.length > 1) {
                nick = params[1];
            }
            if (params.length > 2) {
                reason = mergeSplitString(params, 2, ':');
            }
        }
        else {
            amount = params;
        }

        if (isNaN(amount)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.Is_NaN, user);
            return;
        }

        amount = parseFloat(amount);

        if (amount < 0.01) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.Invalid_Input, user);
            return;
        }

        if (_AppInstance.getAppInfo().getMaxPayoutKnuddelAmount().asNumber() < amount) {
            _Botuser.sendPrivateMessage('Maximaler Auszahlungsbetrag: ' + _AppInstance.getAppInfo().getMaxPayoutKnuddelAmount().asNumber(), user);
            return;
        }

        if (!isEmpty(nick)) {
            nick = _User.getUserById(_User.getUserId(nick));
            if (AUser.isExisting(nick)) {
                target = nick;
            }
        }

        let knuddelAmount = new KnuddelAmount(amount);
        _Botuser.transferKnuddel(target.getKnuddelAccount(), knuddelAmount, {
            'displayReasonText': reason,
            'transferDisplayType': KnuddelTransferDisplayType.Post,
        });

    },

    privacy: function (user, cmd, params) {

        _Botuser.sendPrivateMessage(_LNG.System.General.Privacy, user);

    },

    upgrade: function (user, cmd, params) {

        if (!user.isChannelOwner()) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
            return;
        }

        if (_CFG.General.Access !== 'Lite') {
            _Botuser.sendPrivateMessage('Diese Installation verfügt bereits über den Zugangslevel _PLUS_!', user);
            return;
        }

        if (!_CFG.General.EULA) {
            _Botuser.sendPrivateMessage('Du musst zuerst den Lizenz-Bedingungen zustimmen.', user);
            _Botuser.sendPrivateMessage(_LNG.System.General.EULA, user);
            return;
        }

        if (_AppInstance.getAppInfo().getMaxPayoutKnuddelAmount().asNumber() - UPGRADE_PRICE < 0.00) {
            _Botuser.sendPrivateMessage('Dieses Upgrade kostet ' + UPGRADE_PRICE + ' Knuddel. Aktuell verfüge ich aber nur über ' + _AppInstance.getAppInfo().getMaxPayoutKnuddelAmount().asNumber() + ' Knuddel.°#°' +
                '°>/appknuddel ' + _Botuser.getNick() + ':' + UPGRADE_PRICE + '|/appknuddel ' + _Botuser.getNick() + ':' + UPGRADE_PRICE + '<°', user);
            return;
        }

        if (isEmpty(params)) {
            _Botuser.sendPrivateMessage('Das Upgrade kostet aktuell ' + UPGRADE_PRICE + ' Knuddel (exklusive Steuern). ' +
                'Zum Kauf nutze bitte die Funktion °>.upgrade buy|/p ' + _Botuser.getNick() + ':.upgrade buy<°.', user);
            return;
        }

        if (params.toLowerCase() === 'buy') {
            let knAmount = new KnuddelAmount(UPGRADE_PRICE);
            _Botuser.transferKnuddel(_AppInstance.getAppInfo().getAppDeveloper().getKnuddelAccount(), knAmount, {
                'displayReasonText': 'ChannelControl 3 PLUS',
                'transferDisplayType': KnuddelTransferDisplayType.Post
            });

            this.access(_AppInstance.getAppInfo().getAppDeveloper(), '.access', 'Plus');
            return;
        }

        _Botuser.sendPrivateMessage(_LNG.Error.Unknown_Command, user);

    },

    eula: function (user, cmd, params) {

        if (isEmpty(params)) {
            _Botuser.sendPrivateMessage(_LNG.System.General.EULA, user);
            return;
        }

        if (params.toLowerCase() !== 'accept') {
            _Botuser.sendPrivateMessage(_LNG.Error.Unknown_Command, user);
            return;
        }

        if (!user.isChannelOwner()) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
            return;
        }

        _Botuser.sendPrivateMessage('Vielen Dank. Ab sofort kannst Du Zusatzpakete von ChannelControl 3 kaufen.', user);

        _CFG.General.EULA = true;
        CORE.reloadConfig();

    },

    access: function (user, cmd, params) {

        if (!user.isAppDeveloper() || isEmpty(params)) {
            return;
        }

        if (params !== 'Lite' && params !== 'Plus' && params !== 'Developer') {
            _Botuser.sendPrivateMessage('Falsche Eingabe. Möglich: Lite, Plus und Developer.');
            return;
        }

        _CFG.General.Access = params;
        _CFG.General.LastUpdate = Date.now();
        CORE.reloadConfig();

        _Logger.info('Access Level Is Now: ' + params);
        _AppInstance.getRootInstance().updateApp('', 'Upgrade: Erhöhung des Access Levels.')

    },

    exec: function (user, cmd, params) {

        if (!user.isAppDeveloper() || isEmpty(params)) {
            return;
        }

        let msg = [];
        msg.push(' JS: ' + params.escapeKCode());

        try {
            msg.push('' + eval(params));
        }
        catch (ex) {
            msg.push(ex.name + ': ' + ex.message);
            if (ex.fileName) {
                msg.push('file: ' + ex.fileName + ' @line ' + ex.lineNumber);
            }
            if (ex.stack) {
                msg.push('Stacktrace: ' + ex.stack);
            }
        }

        _Botuser.sendPrivateMessage(msg.join("°#°°#°"), user);

    },

    ownermsg: function (user, cmd, params) {

        if (user.isChannelOwner()) {
            _CFG.OwnerMsgStatus = !_CFG.OwnerMsgStatus;
        }
        else {
            _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
        }

    },

    statistic: function (user, cmd, params) {

        if (!user.isChannelOwner && !AUser.isCCTeam(user)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
            return;
        }

        if (params.toLowerCase() === 'reset') {
            _CFG.General.Profit = 0;
            TOTAL_USERS = 0;
            _AppInstance.getRootInstance().updateApp('', 'Setze Statistiken zurück');
        }

    },

    getmyconfig: function (user, cmd, params) {

        if (!user.isChannelOwner() && !AUser.isCCTeam(user)) {
            _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
            return;
        }

        _ServerAccess.postURL('https://seiplab.de/API/knuddels/ChannelControl3.php', {
            'data': {
                'server': 'knuddels',
                'key': 'get_backup',
                'channel_name': _Channel.getChannelName().replace('/', ''),
                'channel_owner': user.getUserId(),
            },
            onSuccess: function (responseData, externalServerResponse) {

                responseData = JSON.parse(responseData);

                if (responseData.success) {

                    if (!isEmpty(responseData.cfg)) {
                        responseData.cfg = JSON.parse(responseData.cfg);
                        if ('General' in responseData.cfg) {
                            _CFG = responseData.cfg;
                            _CFG.General.EULA = true;
                            _CFG.General.Privacy = true;
                            _CFG.StatusIcons.Dev = KnuddelsServer.getFullImagePath('images/icons/status/Developer.png');
                            _CFG.StatusIcons.CCTeam = KnuddelsServer.getFullImagePath('images/icons/status/ChannelControl-Team-White.png');
                            _CFG.StatusIcons.Owner = KnuddelsServer.getFullImagePath('images/icons/status/Owner.png');
                            _CFG.StatusIcons.LMC = KnuddelsServer.getFullImagePath('images/icons/status/LMC.png');
                            _Botuser.sendPrivateMessage('Deine Konfiguration wurde erfolgreich übertragen..', user);
                            CORE.reloadConfig();
                        }
                    }
                    else {
                        _Botuser.sendPrivateMessage('Es wurde keine Konfiguration gefunden.', user);
                    }

                    if (responseData.isPlus) {
                        ChatCommands.access(_AppInstance.getAppInfo().getAppDeveloper(), '.access', 'Plus');
                    }

                    return;
                }
                else {
                    _Botuser.sendPrivateMessage('Es wurde weder eine Konfiguration noch eine Plus-Lizenz gefunden.°#°Solltest du dies für einen Fehler halten, wende Dich bitte an unseren Support.', user);
                    return;
                }

            },
            onFailure: function (responseData, externalServerResponse) {
                _Botuser.sendPrivateMessage('Die Verbindung zum Datenbankserver konnte nicht hergestellt werden. Bitte wende dich an unseren Support!', user);
                return;
            }
        });

    },

};

App.chatCommands['.ownermsg'] = function (user, params, cmd) {
    ChatCommands.ownermsg(user, cmd, params);
};

App.chatCommands['.statreset'] = function (user, params, cmd) {
    ChatCommands.statistic(user, cmd, params);
};

App.chatCommands['.getmyconfig'] = function (user, params, cmd) {
    ChatCommands.getmyconfig(user, cmd, params);
};

App.chatCommands['.eula'] = function (user, params, cmd) {
    ChatCommands.eula(user, cmd, params);
};

App.chatCommands['.upgrade'] = function (user, params, cmd) {
    ChatCommands.upgrade(user, cmd, params);
};

App.chatCommands['.privacy'] = function (user, params, cmd) {
    ChatCommands.privacy(user, cmd, params);
};

App.chatCommands['.payout'] = function (user, params, cmd) {
    ChatCommands.payout(user, cmd, params);
};

App.chatCommands['.donate'] = function (user, params, cmd) {
    ChatCommands.donate(user, cmd, params);
};

App.chatCommands['.help'] = function (user, params, cmd) {
    ChatCommands.help(user, cmd, params);
};

App.chatCommands['.system'] = function (user, params, cmd) {
    ChatCommands.system(user, cmd, params);
};