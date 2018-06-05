/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 01.05.2018
 * @version: 1.2.0
 * @app: ChannelControl 3
 * @module: Newsletter
 */

/**
 * Predefine object to store newsletter datas
 *
 * @type {{header: string, body: string, sender: string, receivers: Array, index: number, status: string}}
 * @private
 */
let _MNewsletterDatas = {
    'header': '',
    'body': '',
    'sender': '',
    'receivers': [],
    'index': 0,
    'status': 'none'
};

let MNewsletter = {

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
                '.news TOPIC:TEXT*EMPFÄNGER°#°Möglich als EMPFÄNGER: All, Family, Stammi, Team, Ehrenmitglied, Admin'
            ],
        ];
        CORE.registerLanguages('Newsletter', 'Help', langs);

        // Register General Messages
        langs['keys'] = [
            'Everything_Has_To_Be_Filled',
        ];
        langs['items'] = [
            'Es muss ein Betreff, eine Nachricht sowie ein Status angegeben werden.',
        ];
        CORE.registerLanguages('Newsletter', 'Error', langs);

        // Register General Messages
        langs['keys'] = [
            'Preparing_CMD',
            'Preparing',
            'Complete',
            'Signature',
            'Status_Changed',
        ];
        langs['items'] = [
            'Der Newsletter wird vorbereitet. Bitte habe ein wenig Geduld.',
            'Der Newsletter wird versendet.',
            'Der Newsletter wurde erfolgreich versendet. ($RECEIVERS Empfänger)',
            '°#°°#°Mit freundlichen Grüßen,°#°°#°$BOTNAME°#°°#°Diese Nachricht stammt aus dem _Channel $CHANNELNAME_°#°Generiert durch °BB°_$APPNAME $APPVERSION§.°#°°>{button}Newsletter deaktivieren|0|call|/p ' + _Botuser.getNick() + ':.newsletter<°',
            'Du hast Deinen Newsletterstatus erfolgreich geändert. Aktueller Status: $STATUS'
        ];
        CORE.registerLanguages('Newsletter', 'General', langs);

    },

    intvall: function () {

        if (this.shouldSendAutoNews()) {
            _CFG.Newsletter.LastIntervall = Date.now();
            let datas = {
                'status': _CFG.Newsletter.Status,
                'subject': _CFG.Newsletter.Subject,
                'message': _CFG.Newsletter.Message,
            };
            this.prepareNewsletter(_ChOwners[0], datas);
        }

    },

    shouldSendAutoNews: function () {
        return _CFG.Newsletter.IsActive && Date.now() >= _CFG.Newsletter.LastIntervall + (_CFG.Newsletter.Intervall * 60 * 60 * 1000)
            && _MNewsletterDatas.status === 'none' && !isEmpty(_CFG.Newsletter.Subject) && !isEmpty(_CFG.Newsletter.Message) && _CFG.General.Access !== 'Lite';
    },

    /**
     * Intervall to check if we should send News
     */
    checkStatus: function () {

        setInterval(function () {

            if (_MNewsletterDatas.status === 'preparing') {
                MNewsletter.sendNewsletter();
            }

        }, 60 * 1000);

    },

    /**
     * Check if user is allowed to use news command
     *
     * @param user
     * @returns {Boolean}
     */
    allowed: function (user) {

        return user.isChannelOwner() || user.isAppManager();

    },

    /**
     * Send help message to user
     *
     * @param user
     */
    help: function (user) {

        let msg = _LNG.Newsletter.Help.Usage;

        _LNG.Bot.Help.UsageCMDs.forEach(function (item) {
            msg += item + '°#°';
        });

        _Botuser.sendPrivateMessage(msg, user);

    },

    /**
     * Preparing newsletter and save global _MNewsletterDatas
     *
     * @param user
     * @param datas
     */
    prepareNewsletter: function (user, datas) {

        if (isEmpty(datas.subject) || isEmpty(datas.message) || isEmpty(datas.status)) {
            _Botuser.sendPrivateMessage(_LNG.Newsletter.Error.Everything_Has_To_Be_Filled, user);
            return;
        }

        if (!isNaN(datas.status)) {
            datas.status = parseInt(datas.status);
        }
        else {
            _Botuser.sendPrivateMessage(_LNG.System.Error.Invalid_Input, user);
            return;
        }

        _MNewsletterDatas.header = datas.subject;
        _MNewsletterDatas.body = datas.message.replace(/(?:\r\n|\r|\n)/g, '°#°');
        _MNewsletterDatas.sender = user;

        if ('key' in datas) {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.Newsletter.General.Preparing_CMD
            });
        }
        else {
            _Botuser.sendPrivateMessage(_LNG.Newsletter.General.Preparing_CMD, user);
        }

        this.getReceivers(datas.status);

    },

    /**
     * Get newsletter receivers by status
     *
     * @param status
     */
    getReceivers: function (status) {

        let userstatus = [UserStatus.Newbie, UserStatus.Family, UserStatus.Stammi, UserStatus.HonoryMember, UserStatus.Admin, 'team'];
        status = userstatus[status];

        let parameters = {
            onStart: function (accessibleUserCount) {
            },
            onEnd: function (accessibleUserCount) {
                _MNewsletterDatas.status = 'preparing';
            }

        };

        _User.eachAccessibleUser(function (user, index, accessibleUserCount) {

            if (!AUser.isExisting(user)) {
                return;
            }

            var targetDatas = AUser.getUserDatas(user);

            if (!targetDatas.Newsletter.SignOn && status !== 'team') {
                return;
            }

            if (status !== 'team') {
                if (!user.getUserStatus().isAtLeast(status)) {
                    return;
                }
            }

            if (status === 'team' && !user.isEventModerator() && !user.isChannelModerator() && !user.isAppManager() && !user.isChannelOwner()) {
                return;
            }

            _MNewsletterDatas.receivers.push(user);

        }, parameters);

    },

    /**
     * Send newsletter to all receivers
     * Intervall is selfstopping at the end
     */
    sendNewsletter: function () {

        if (_MNewsletterDatas.status === 'preparing') {
            _MNewsletterDatas.status = 'sending';
            _Botuser.sendPrivateMessage(_LNG.Newsletter.General.Preparing, _MNewsletterDatas.sender);
        }

        let intvall = setInterval(function () {

            if (_MNewsletterDatas.index < _MNewsletterDatas.receivers.length) {

                Mailer.sendMessage(_MNewsletterDatas.receivers[_MNewsletterDatas.index],
                    {
                        'header': _MNewsletterDatas.header,
                        'body': _MNewsletterDatas.body,
                        'type': 'newsletter'
                    },
                    _MNewsletterDatas.sender);

                _MNewsletterDatas.index += 1;
            }
            else {

                _Botuser.sendPrivateMessage(_LNG.Newsletter.General.Complete.formater({
                    'RECEIVERS': _MNewsletterDatas.index
                }), _MNewsletterDatas.sender);

                _MNewsletterDatas = {
                    'header': '',
                    'body': '',
                    'sender': '',
                    'receivers': [],
                    'index': 0,
                    'status': 'none'
                };

                clearInterval(intvall);

            }

        }, 200);

    },

    getUI: function (user) {
        let content = AppContent.popupContent(new HTMLFile('/acp/newsletter.html'), 650, 420);
        if (user.canSendAppContent(content)) {
            user.sendAppContent(content);
        }
    },


};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MNewsletter = function (action) {

    if (action !== 'start') {
        return;
    }

    MNewsletter.preload();
    MNewsletter.checkStatus();

};

/**
 * Extends System Cronjob
 *
 * @constructor
 */
Cronjob.MNewsletter = function () {

    if (_CFG.General.Access === 'Lite') {
        return;
    }

    MNewsletter.intvall();

};

/**
 * Extends System ChatCommands
 *
 * @param user
 * @param cmd
 * @param params
 */
ChatCommands.news = function (user, cmd, params) {

    if (!MNewsletter.allowed(user)) {
        _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
        return;
    }

    if (isEmpty(params)) {
        params = '';
    }

    if (params.contains(':')) {
        params = params.split(':');
        if (params.length >= 1) {

            let datas = {
                'status': '',
                'subject': params[0],
                'message': ''
            };

            // Merging and split params again to get body of newsletter and status
            params = mergeSplitString(params, 2, ':');
            if (params.contains('*')) {
                params = params.split('*');
                datas.message = params[0];
                datas.status = params[1].toLowerCase();
            }
            else {
                datas.message = params;
                datas.status = 'all';
            }

            switch (datas.status) {
                case 'family':
                    datas.status = 1;
                    break;
                case 'stammi':
                    datas.status = 2;
                    break;
                case 'ehrenmitglied':
                    datas.status = 3;
                    break;
                case 'admin':
                    datas.status = 4;
                    break;
                case 'team':
                    datas.status = 5;
                    break;
                default:
                    datas.status = 0;
                    break;
            }

            MNewsletter.prepareNewsletter(user, datas);
            return;
        }
    }

    MNewsletter.getUI(user);

};

App.chatCommands['.news'] = function (user, params, cmd) {
    ChatCommands.news(user, cmd, params);
};

/**
 * Extends System ChatCommands
 *
 * @param user
 * @param cmd
 * @param params
 */
ChatCommands.newsletter = function (user, cmd, params) {

    let userDatas = AUser.getUserDatas(user);
    let status = 'Aktiviert';
    userDatas.Newsletter.SignOn = !userDatas.Newsletter.SignOn;
    user.getPersistence().setObject('User', userDatas);
    if (!userDatas.Newsletter.SignOn) {
        status = 'Deaktiviert';
    }
    _Botuser.sendPrivateMessage(_LNG.Newsletter.General.Status_Changed.formater({'STATUS': status}), user);

};

App.chatCommands['.newsletter'] = function (user, params, cmd) {
    ChatCommands.newsletter(user, cmd, params);
};

/**
 * ACP UI
 *
 * @type {{type: string, content: AppContent}}
 */
MACP.UI.newsletter = {
    type: 'popup',
    content: AppContent.popupContent(new HTMLFile('/acp/cfg_newsletter.html'), 650, 420)
};

/**
 * Get ACP UI Datas
 *
 * @returns {{SignOn: boolean}|Newsletter|{SignOn}|{IsActive: boolean, Intervall: number, LastIntervall: number, Status: number, Subject: string, Message: string}|{IsActive, Intervall, LastIntervall, Status, Subject, Message}}
 */
MACP.ACPUIDatas.newsletter = function () {
    return _CFG.Newsletter;
};

/**
 * Checks new config and saves them
 *
 * @param user
 * @param datas
 * @constructor
 */
MACP.ConfigCheck.Newsletter = function (user, datas) {

    if (!isNaN(datas.Intervall)) {
        datas.Intervall = parseInt(datas.Intervall);
        if (datas.Intervall >= 1) {
            _CFG.Newsletter.Intervall = datas.Intervall;
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.System.Error.Number_Is_Too_Small.formater({'KEY': 'Intervall', 'INT': '1'})
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

    _CFG.Newsletter.Subject = getEscapedString(datas.Subject);
    _CFG.Newsletter.Message = getEscapedString(datas.Message);

    user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
        'msg': _LNG.System.General.Setings_Changed
    });

    CORE.reloadConfig();
    MACP.getUIDatas(user, datas.page);

};