/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 07.10.2017
 * @version: 1.0.0
 * @app: ChannelControl 3
 * @system: CORE
 */

let CORE = {

    isInstalled: function () {
        return !Install.isFirstStart();
    },

    makeInstall: function () {

        if (!_Persistence.hasObject('CFG')) {
            _Persistence.setObject('CFG', {
                'General': {
                    'InstallDate': Date.now(),
                    'LastUpdate': Date.now(),
                    'Version': '3.7.0',
                    'Access': 'Lite',
                    'EULA': true,
                    'Privacy': true,
                    'CommandSign': '.',
                    'LastSystemAd': Date.now(),
                    'Profit': 0,
                    'OwnerMsgStatus': true,
                    'LastIntervall': Date.now(),
                    'Extern': {
                        'UserId': -1,
                        'PlusId': -1,
                        'ConfigId': -1,
                    },
                },
                'Advertise': {
                    'IsActive': false,
                    'Intervall': 30,
                    'LastIntervall': 0,
                    'Message': [
                        'Dies ist eine Werbenachricht 1',
                        'Dies ist eine Werbenachricht 2',
                        'Dies ist eine Werbenachricht 3',
                    ]
                },
                'Blacklist': {
                    'IsActive': true,
                    'userIDs': [],
                },
                'Bot': {
                    'IsMuted': false,
                    'IsEventMode': false,
                },
                'BotGreeting': {
                    'IsActive': true,
                    'MaxUsers': 5,
                    'IsUserGreetingActive': true,
                    'IsCMGreetingActive': true,
                    'IsOwnerGreetingActive': true,
                    'IsDevGreetingActive': true,
                    'Greetings': {
                        'User': [],
                        'CM': [],
                        'Owner': [],
                        'Dev': []
                    },
                },
                'Botknuddel': {
                    'IsActive': false,
                    'Intervall': 45,
                    'LastIntervall': 0,
                    'MinKnuddel': 0.01,
                    'MaxKnuddel': 1.00,
                    'MinUsers': 5,
                },
                'LoginBonus': {
                    'IsActive': false,
                    'Intervall': 5,
                    'LastIntervall': 0,
                    'UserMinStatus': 1,
                    'BaseValue': 0.01,
                    'MaxMultiply': 7,
                },
                'MuteNotify': {
                    'IsActive': true,
                    'Notified': [],
                },
                'Newsletter': {
                    'IsActive': false,
                    'Intervall': 24,
                    'LastIntervall': 0,
                    'Status': 0,
                    'Subject': '',
                    'Message': '',
                },
                'StatusIcons': {
                    'IsActive': true,
                    'IsLMCIconActive': true,
                    'IsOwnerIconActive': true,
                    'IsDevIconActive': true,
                    'LMC': KnuddelsServer.getFullImagePath('images/icons/status/LMC.png'),
                    'Owner': KnuddelsServer.getFullImagePath('images/icons/status/Owner.png'),
                    'CCTeam': KnuddelsServer.getFullImagePath('images/icons/status/ChannelControl-Team-White.png'),
                    'Dev': KnuddelsServer.getFullImagePath('images/icons/status/Developer.png')
                },
                'TopList': {
                    'Activity': {
                        'IsActive': true,
                        'Points': {
                            'Gaming': 5,
                            'Hours': 15,
                            'Kiss': 5,
                            'Knuddel': 7,
                            'Msg': 3,
                        },
                    }
                },
            });

        }
    },

    registerLanguages: function (module, sub, langs) {

        if (!isObject(_LNG)) {
            _Logger.fatal('LANGUAGE OBJECT IS BROKEN!');
            _LNG = {};
        }

        // Creates _LNG.module
        if (!(module in _LNG)) {
            _LNG[module] = {};
        }

        // Creates _LNG.module.sub
        if (!(sub in _LNG[module])) {
            _LNG[module][sub] = {};
        }

        langs['items'].forEach(function (item, key) {
            if (!(langs['keys'][key] in _LNG[module][sub])) {
                _LNG[module][sub][langs['keys'][key]] = item;
            }
        });

    },

    getConfig: function () {
        _CFG = _Persistence.getObject('CFG');
    },

    reloadConfig: function () {
        _Persistence.setObject('CFG', _CFG);
        this.getConfig();
    },

};