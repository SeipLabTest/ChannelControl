/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 29.05.2018
 * @version: 3.7.0
 * @app: Knuddels.de UserApp - ChannelControl 3
 * @description: ChannelControl App Version 3
 */

let App = {};

/**
 * Botuser Object
 *
 * @type {BotUser}
 * @private
 */
_Botuser = KnuddelsServer.getDefaultBotUser();

/**
 * AppInstance Object
 *
 * @type {AppInstance}
 * @private
 */
_AppInstance = KnuddelsServer.getAppAccess().getOwnInstance();

/**
 * Channel Object
 *
 * @type {Channel}
 * @private
 */
_Channel = KnuddelsServer.getChannel();

/**
 * Logger Object
 *
 * @type {Logger}
 * @private
 */
_Logger = KnuddelsServer.getDefaultLogger();

/**
 * Persistence Object
 *
 * @type {AppPersistence}
 * @private
 */
_Persistence = KnuddelsServer.getPersistence();

/**
 * User Access Object
 *
 * @type {UserAccess}
 * @private
 */
_User = KnuddelsServer.getUserAccess();

_ServerAccess = KnuddelsServer.getExternalServerAccess();

_ChOwners = _Channel.getChannelConfiguration().getChannelRights().getChannelOwners();

/**
 * Prepare Config Object
 *
 * @type {{}}
 * @private
 */
_CFG = {};

_IMG = {
    'Icons': {
        'LMC': KnuddelsServer.getFullImagePath('images/icons/status/LMC.png'),
        'MCM': KnuddelsServer.getFullImagePath('images/icons/status/MCM.png'),
        'Owner': KnuddelsServer.getFullImagePath('images/icons/status/Owner.png'),
        'Knuddel': KnuddelsServer.getFullImagePath('images/icons/knuddel.gif'),
    }
};

UPGRADE_PRICE = 119.99;
TOTAL_USERS = 0;

/**
 * Prepare Language Object
 *
 * @type {{}}
 * @private
 */
_LNG = {
    'System': {
        'General': {
            'EULA': 'Die Nutzungsbedingungen für diese App findest du unter °>Nutzungsbedingungen ChannelControl (externer Link)|https://seiplab.de/channelcontrol---nutzungsbedingungen/<°°#°',
            'Privacy': 'Die Datenschutzerklärung für diese App findest du unter °>Datenschutzerklärung ChannelControl (externer Link)|https://seiplab.de/knuddels-datenschutz/<°',
            'SystemAdText': '"Erstelle auch Du Deinen eigenen Channel mit ChannelControl. Einfach im eigenem Channel installieren mittels: °BB°/apps install knuddelsDEV.30565543.ChannelControl"',
            'Owner_Welcome_Message': 'Wichtige Befehle: °>.acp|/p ' + _Botuser.getNick() + ':.acp<° | °>.help|/p ' + _Botuser.getNick() + ':.help<°°#°°>.ownermsg zum deaktivieren dieser Nachricht|/p ' + _Botuser.getNick() + ':.ownermsg<°',
            'Setings_Changed': 'Änderungen wurden erfolgreich gespeichert!',
            'Privacy_Disclaimer': 'Dieser Channel verwendet ChannelControl 3. Diese App erhebt Daten für den Channelbesitzer. Diese Daten sind ausschließlich Lokal in diesem MyChannel verfügbar und werden nicht extern übermittelt oder gespeichert. °#°°>Datenschutzerklärung ChannelControl 3 (externer Link)|https://seiplab.de/knuddels-datenschutz/<°',
        },
        'Error': {
            'Unexpected_Error': 'Es trat ein unerwarteter Fehler auf.',
            'NoRights': 'Du hast nicht genügend Rechte für diese Funktion.',
            'User_Does_Not_Exist': 'Dieser Nutzer ist mir nicht bekannt.',
            'UI_Device_Problems': 'Diese Funktion ist auf Deinem Gerät nicht verfügbar. Bitte versuche es im HTML-Chat, PC-App oder Android-App.',
            'Unknown_Command': 'Dieser Befehl ist mir nicht bekannt.',
            'Is_NaN': 'Dies ist keine gültige Zahl.',
            'Not_Enough_Knuddel': 'Du besitzt nicht genügend Knuddel für diese Aktion. Nutze °>/appknuddel ' + _Botuser.getNick() + ':$AMOUNT|/appknuddel ' + _Botuser.getNick() + ':$AMOUNT<° zum aufladen.',
            'Only_Plus': 'Diese Funktion ist nur in der Plus-Version verfügbar. Nutze °BB°°>.upgrade|/p ' + _Botuser.getNick() + ':.upgrade<°§',
            'Invalid_Input': 'Diese Eingabe ist nicht gültig.',
            'Function_Is_Disabled': 'Diese Funktion wurde vom Channel-Besitzer deaktiviert.',
            'Module_Is_Disabled': 'Dieses Modul wurde vom Channel-Besitzer deaktiviert.',
            'Change_Settings': 'Speichern nicht erfolgreich.',
            'Number_Is_Too_Small': '$KEY darf nicht kleiner als $INT sein.',
            'Modul_Doesnt_Exist': 'Dieses Modul existiert nicht.',
        },
        'Mailer': {
            'Signature': '°#°°#°Mit freundlichen Grüßen,°#°$BOTNAME°#°°#°Diese Nachricht stammt aus dem _Channel $CHANNELNAME_°#°Generiert durch °BB°_$APPNAME $APPVERSION§.'
        }
    }
};

App.chatCommands = {};

require('system/utils/VarUtils.js');
require('system/utils/DateTimeUtils.js');
require('system/utils/UserUtils.js');
require('system/utils/Random.js');
require('system/CORE.js');
require('system/OnStartStop.js');
require('system/OnMessage.js');
require('system/ChatCommand.js');
require('system/OnJoinLeft.js');
require('system/User.js');
require('system/Mailer.js');
require('system/Cronjob.js');
require('system/Updater.js');
require('system/Install.js');

App.onAppStart = function () {

    _Persistence.deleteObject('CFG');

    if (CORE.isInstalled()) {
        CORE.getConfig();
        Updater.doUpdate();

        OnStartStop.handler('start');

        let parameters = {
            onStart: function (accessibleUserCount) {
            },
            onEnd: function (accessibleUserCount) {
            }
        };
        _User.eachAccessibleUser(function (user, index, accessibleUserCount) {
            if (AUser.isExisting(user)) {

                if (!user.getPersistence().hasNumber('ActivityLevel') && user.getUserType() === UserType.Human) {
                    user.getPersistence().setNumber('ActivityLevel', user.getPersistence().getObject('User').TopList.Activity.Level);
                }

                if (user.getUserType() !== UserType.Human) {
                    user.getPersistence().setNumber('ActivityLevel', 1);
                    user.getPersistence().deleteNumber('ActivityLevel');
                }

                TOTAL_USERS++;
            }
        }, parameters);
    }
    else {
        Install.prepareInstall();
    }

};

App.onShutdown = function () {
    if (CORE.isInstalled()) {
        CORE.reloadConfig();
    }
};

App.onEventReceived = function (user, key, datas) {

    if (CORE.isInstalled()) {
        if (key.toLowerCase() === 'acp_index') {
            ChatCommands.acp(user, key, datas.content);
        }

        if (key.toLowerCase() === 'config') {
            switch (datas.action) {
                case 'switch':
                    MACP.switchModule(user, datas.module, datas.sub, datas.page);
                    break;
                case 'change':
                    MACP.setModuleConfig(user, datas);
                    break;
            }
        }

        if (key.toLowerCase() === 'election') {
            MElection.addVoting(user, datas);
        }

        if (key.toLowerCase() === 'public') {
            switch (datas.content) {
                case 'help':
                    ChatCommands.help(user, key, datas.content);
                    break;
            }
        }

        if (key.toLowerCase() === 'greedy') {
            MGreedy.feedThePig(user, datas.amount);
            return;
        }

        if (key.toLowerCase() === 'upgrade') {
            ChatCommands.upgrade(user, '', '');
            return;
        }

        if (key.toLowerCase() === 'nutshell') {
            MNutshell.placeBet(user, datas.amount, datas.selected);
            return;
        }

        if (key.toLowerCase() === 'userfeedback') {
            MCCTeam.sendUserFeedbackToDeveloper(user, datas);
            return;
        }

        if (key.toLowerCase() === 'newsletter') {
            datas.key = 'ui';
            MNewsletter.prepareNewsletter(user, datas);
            return;
        }
    }

};

App.mayJoinChannel = function (user) {

    if (CORE.isInstalled()) {
        if (_CFG.Blacklist.IsActive && MBlacklist.isBlacklisted(user)) {
            return ChannelJoinPermission.denied('°#°' + _LNG.Blacklist.Error.Not_Joinable);
        }

        if (AUser.isExisting(user)) {
            let userDatas = AUser.getUserDatas(user);
            if (userDatas.Lock.IsLocked) {
                return ChannelJoinPermission.denied('°#°' + userDatas.Lock.Reason);
            }
        }
    }

    return ChannelJoinPermission.accepted();

};

App.onUserJoined = function (user) {
    if (CORE.isInstalled()) {
        OnJoinLeft.handler(user, 'join');
    }
};

App.onUserLeft = function (user) {
    if (CORE.isInstalled()) {
        OnJoinLeft.handler(user, 'left');
    }
};

App.onPrivateMessage = function (message) {
    if (CORE.isInstalled()) {
        let user = _User.getUserById(_User.getUserId(message.getAuthor()));
        OnMessage.messageHandler(user, message.getText(), 'private');
    }
};

App.mayShowPublicMessage = function (message) {
    if (CORE.isInstalled()) {
        let user = _User.getUserById(_User.getUserId(message.getAuthor()));
        let userDatas = AUser.getUserDatas(user);
        let msg = message.getText().replaceAll('#°!°', '°#°');
        return !(OnMessage.messageHandler(user, msg, 'public') || userDatas.Mute.IsMuted);
    }
};

App.onPublicMessage = function (message) {
};

App.mayShowPublicActionMessage = function (message) {
};

App.onAccountReceivedKnuddel = function (sender, receiver, knuddelAmount, transferReason, knuddelAccount) {
    sender.sendPrivateMessage('Deine Einzahlung von ' + knuddelAmount.asNumber() + ' Knuddel wurde Deinem Konto gutgeschrieben.');
};

App.onKnuddelReceived = function (sender, receiver, knuddelAmount, transferReason) {
    sender.sendPrivateMessage('Es wurden ' + knuddelAmount.asNumber() + ' Knuddel von Deinem Konto abgebucht.');
};

require('modules/ACP/main.js');
require('modules/Advertise/main.js');
require('modules/Bot/main.js');
require('modules/Botknuddel/main.js');
require('modules/TopicChanger/main.js');
require('modules/Teamchat/main.js');
require('modules/BotGreeting/main.js');
require('modules/StatusIcon/main.js');
require('modules/TopActivity/main.js');
require('modules/Newsletter/main.js');
require('modules/AppLock/main.js');
require('modules/AppMute/main.js');
require('modules/Blacklist/main.js');
require('modules/LoginBonus/main.js');
require('modules/UserProfile/main.js');
require('modules/MuteNotify/main.js');
require('modules/ReadmeRaffle/main.js');