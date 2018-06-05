/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 05.06.2018
 * @version: 1.1.0
 * @app: ChannelControl 3
 * @system: Updater
 */

let Updater = {

    shouldUpdate: function () {

        return _CFG.General.LastUpdate + (24 * 60 * 60 * 1000) <= Date.now();

    },

    isDBUpdate: function () {

        return Date.now() - knuddelstimeToTimestamp(_AppInstance.getStartDate()) <= (54 * 1000);

    },

    doUpdate: function () {

        if (this.shouldUpdate()) {
            _CFG.General.LastUpdate = Date.now();
            CORE.reloadConfig();
            _AppInstance.getRootInstance().updateApp('', 'Suche nach Updates');
        }

        if (this.isDBUpdate()) {

            let O = Updates;
            Object.keys(O).forEach(function (key) {
                if (key !== 'handler') {
                    O[key]();
                }
            });

            CORE.reloadConfig();
            _Logger.info('Alles ist auf dem neustem Stand');
        }

    },

};

let Updates = {

    V350: function () {
        if (_CFG.General.Version === '3.4.2') {
            _CFG.General.Version = '3.5.0';

            _CFG.General.Privacy = false;
            _CFG.General.Extern = {
                'Username': '',
                'PlusId': -1,
                'ConfigId': -1,
            };
            _CFG.Greedy.BetValues = [1, 10, 100];
            _CFG.Greedy.Value.Opening = [_CFG.Greedy.Value.Start];

            let msg = 'Lieber $USER!°#°°#°In deinem Channel läuft nun ChannelControl in der _Version 3.5.0_°#°°#°Dieses Update beinhaltet insbesondere die notwendigen Funktionen für den bevorstehenden Wechsel der Projektleitung.°#°Es wurden aber auch ein paar der oft gewünschten Ideen umgesetzt. Welche das genau sind kannst du unserem Changelog (°>Changelog|https://seiplab.de/forum/board/6-changelog/<°) entnehmen.°#°°#°_WICHTIG_:°#°Nutze den Befehl °BB°.savemyconfig§ um deine Konfiguration und Lizenzdaten zu sichern!';

            Mailer.sendMessage(_ChOwners[0], {
                'type': 'system',
                'header': 'ChannelControl 3.5',
                'body': msg,
            }, _AppInstance.getAppInfo().getAppDeveloper());

        }
    },

    V351: function () {
        if (_CFG.General.Version === '3.5.0') {
            _CFG.General.Version = '3.5.1';
        }
    },


    V360: function () {
        if (_CFG.General.Version === '3.5.1') {
            _CFG.General.Version = '3.6.0';

            _CFG.Newsletter = {
                'IsActive': false,
                'Intervall': 24,
                'LastIntervall': 0,
                'Status': 0,
                'Subject': '',
                'Message': '',
            };

            let msg = 'Hey $USER,°#°°#°' +
                'ich möchte dich nur darüber informieren, dass ich seit diesem Moment in der Version 3.6 laufe!°#°' +
                'Alle Änderungen findest du in meinem °>Changelog|https://seiplab.de/forum/thread/18-version-3-6/<°°#°°#°' +
                'Das SeipLab-Team wünscht dir weiterhin viel Spaß mit ChannelControl 3.6! :)';

            Mailer.sendMessage(_ChOwners[0], {
                'type': 'system',
                'header': 'ChannelControl 3.6',
                'body': msg,
            }, _AppInstance.getAppInfo().getAppDeveloper());

        }
    },

    V361: function () {
        if (_CFG.General.Version === '3.6.0') {
            _CFG.General.Version = '3.6.1';

            let msg = 'Hey $USER,°#°°#°' +
                'wusstest du schon? ChannelControl 3 _Plus_ kannst du jetzt für nur _1 Knuddel_ kaufen!°#°' +
                'Dabei handelt es sich um eine ganz normale Plus-Version ohne jede Einschränkungen. Wir wünschen dir damit viel Erfolg in deinem MyChannel. :)°#°' +
                'Alle Änderungen findest du in meinem °>Changelog|https://seiplab.de/forum/thread/18-version-3-6/?postID=60#post60<°°#°°#°' +
                'Das SeipLab-Team wünscht dir weiterhin viel Spaß mit ChannelControl 3.6.1! :)';

            Mailer.sendMessage(_ChOwners[0], {
                'type': 'system',
                'header': 'ChannelControl 3.6.1',
                'body': msg,
            }, _AppInstance.getAppInfo().getAppDeveloper());

        }
    },

    V362: function () {
        if (_CFG.General.Version === '3.6.1') {
            _CFG.General.Version = '3.6.2';
        }
    },

    V370: function () {
        if (_CFG.General.Version === '3.6.2') {
            _CFG.General.Version = '3.7.0';

            let msg = 'Hey $USER,°#°°#°' +
                'das Update auf Version 3.7.0 war erfolgreich.°#°' +
                'Alle Änderungen findest du in meinem °>Changelog|https://seiplab.de/forum/thread/32-version-3-7/<°°#°°#°' +
                'Das SeipLab-Team wünscht dir weiterhin viel Spaß mit ChannelControl 3.7.0! :)';

            Mailer.sendMessage(_ChOwners[0], {
                'type': 'system',
                'header': 'ChannelControl 3.7.0',
                'body': msg,
            }, _AppInstance.getAppInfo().getAppDeveloper());

        }
    },

};

/**
 * Extends System Cronjob
 *
 * @constructor
 */
Cronjob.Updater = function () {

    Updater.doUpdate();

};