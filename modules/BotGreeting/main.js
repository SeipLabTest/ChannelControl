/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 25.03.2018
 * @version: 1.1.0
 * @app: ChannelControl 3
 * @module: BotGreeting
 */

let MBotGreeting = {

    /**
     * Preload language items
     */
    preload: function () {

        let langs = ['keys', 'items'];

        // Register Error Messages
        langs['keys'] = [
            'Max_User_Is_Null',
            'Is_NaN'
        ];
        langs['items'] = [
            'Die maximalen User dürfen nicht kleiner als 1 sein.',
            '$KEY ist keine Zahl.'
        ];
        CORE.registerLanguages('BotGreeting', 'Error', langs);

        // Register Greeting Messages
        langs['keys'] = [
            'User',
            'CM',
            'Owner',
            'Dev'
        ];
        langs['items'] = [
            [
                'Willkommen, $USER!',
                '$USER, pünktlich auf die Minute. Gerade ist der Tee fertig geworden.',
                'Hey, $USER!',
                'Willkommen in unserer gemütlichen Runde, $USER.',
                'Schön dich mal wieder hier zu sehen, $USER',
                'Hallo $USER, ich hab dich schon vermisst.',
                'Hallöchen $USER',
                'Huhu $USER! Schön dich zu sehen.',
                'Huch, $USER... Was machst du denn hier?',
                'Hast du heute frei, $USER?',
                '$RUSER freut sich genauso wie ich, dass du wieder hier bist, $USER',
                '$USER ist da, jetzt kann die Party los gehen!',
                'Willkommen $USER, hast du einen neuen Haarschnitt?',
                '$USER, $USER, $USER! Huhuuu!',
                'Eine Freude dich in unserer kleinen Runde begrüßen zu dürfen, $USER.',
                'Gib die Jacke ruhig mir, ich werde sie fein säuberlich aufhängen, $USER',
                'Hey $USER, du siehst heute wieder richtig flott aus!',
                'Oh $USER, da bist du ja. $RUSER und ich haben uns schon gefragt, wann du mal wieder da bist...',
                'Na sieh mal an! $USER?! Möchtest du auch ein Stück Pizza?'
            ],
            [
                'Hallo $USER, hier deine Mute-Texte.',
                '$USER, du siehst aus, als wolltest du gleich jemanden kicken?!',
                'Gott sei dank ist $USER hier. Nun sollten sich alle wieder an die Regeln halten.',
                'Nun ist endlich schluss mit dem Affenzirkus, $USER ist wieder da.',
                '$USER steht euch nun für Fragen und Probleme zur Verfügung.',
                'Endlich, $USER. Deine Schicht hat schon vor 10 Minuten angefangen!',
                'Wir dachten schon du kommst heute gar nicht mehr zur Arbeit, $USER',
                'Gerade haben wir darüber gesprochen, dass du hart aber fair bist, $USER.',
                'Schon wieder zu spät, schon wieder mit ungebügeltem Hemd, $USER. Das geht so nicht weiter.',
                'Halloooo, $USER! Schön dass du wieder hier bist!',
                '$USER wie gehts dir? Habe ich schon erwähnt, wie schön es ist, dass du dich für diesen Channel einsetzt?',
                'Typisch $USER! Gerade angekommen und sofort voller Tatendrang an die Arbeit!',
                'Hallo $USER, $RUSER hat schon auf dich gewartet.',
                'Hey $USER, ich habe eine Geheimnis für dich! $RUSER steht auf Autoritätspersonen!',
                '$USER, könntest du mir vielleicht bei meinem Urlaubsantrag helfen?',
                'Hallo $USER, gerade habe ich davon erzählt, wie nett und hilfsbereit du bist!'
            ],
            [
                'Hallo $USER! Danke, dass du diesen schönen Channel erstellt hast!',
                'Gott sei dank ist $USER hier. Nun sollten sich alle wieder an die Regeln halten.',
                'Halloooo $USER! Schön, dass du wieder hier bist!',
                'Hey $USER, ich habe eine Geheimnis für dich! $RUSER steht auf Autoritätspersonen!',
                'Hey $USER, wusstest du schon, dass $RUSER für deinen Channel schwärmt?'
            ],
            [
                '$USER, $USER, ich habe einen BUG gefunden.... Ich habe kein Gehalt bekommen?!',
                'Ich hoffe, du bist nicht hier weil es ein Problem mit mir gibt, $USER?',
                'Welch ein Ehre dich mal wieder zu sehen, $USER.',
                'Ich hab dich seit dem letzten Update nicht mehr gesehen, $USER. Hallo!',
                'Hallo $USER, mein Herr und Gebieter!',
                'Ich bin so froh dich mal wieder zu sehen $USER!',
                'Keine Panik! $USER ist da um alles wieder ins Lot zu bringen.',
                'Du kannst tun was du willst, $USER. Niemand kann dich aufhalten!',
                'Oh, mein Schöpfer! Ich bin deiner nicht würdig, $USER!',
                'Ich brauche unbedingt eine Pause, $USER.',
                'Gerade wollte ich anfangen das Channelthema zu reinigen, $USER.... Wirklich!',
                '$USER, bist du zum Privatvergnügen hier oder um zu arbeiten?',
                '$USER, ich muss einen BUG melden! In meinem Arbeitsvertrag steht, ich habe keinen Urlaub?!',
                'Hey $USER, können wir nochmal über mein Gehalt verhandeln?'
            ],
        ];
        CORE.registerLanguages('BotGreeting', 'Greetings', langs);

    },

    /**
     * We check here if the bot is allowed to greet this user
     *
     * @param user
     * @returns {boolean}
     */
    shouldGreet: function (user) {

        if (user.isAppDeveloper() && _CFG.BotGreeting.IsDevGreetingActive) {
            return true;
        }

        if (!_CFG.BotGreeting.IsActive || _Channel.getOnlineUsers(UserType.Human).length > _CFG.BotGreeting.MaxUsers) {
            return false;
        }

        if (user.isChannelOwner() && _CFG.BotGreeting.IsOwnerGreetingActive) {
            return true;
        }

        if (user.isChannelModerator() && _CFG.BotGreeting.IsCMGreetingActive) {
            return true;
        }

        if (_CFG.BotGreeting.IsUserGreetingActive) {
            return true;
        }

        return false;

    },

    /**
     * We grab a random greeting message for this user
     *
     * @param user
     * @returns {Object}
     */
    getGreetingMsg: function (user) {

        let greetings = [];

        greetings = _CFG.BotGreeting.Greetings.User;

        if (isEmpty(greetings) || greetings.length < 1) {
            greetings = _LNG.BotGreeting.Greetings.User;
        }

        if (user.isChannelModerator() && _CFG.BotGreeting.IsCMGreetingActive) {
            greetings = _CFG.BotGreeting.Greetings.CM;
            if (isEmpty(greetings) || greetings.length < 1) {
                greetings = _LNG.BotGreeting.Greetings.CM;
            }
        }

        if (user.isChannelOwner() && _CFG.BotGreeting.IsOwnerGreetingActive) {
            greetings = _CFG.BotGreeting.Greetings.Owner;
            if (isEmpty(greetings) || greetings.length < 1) {
                greetings = _LNG.BotGreeting.Greetings.Owner;
            }
        }

        if (user.isAppDeveloper() && _CFG.BotGreeting.IsDevGreetingActive) {
            greetings = _CFG.BotGreeting.Greetings.Dev;
            if (isEmpty(greetings) || greetings.length < 1) {
                greetings = _LNG.BotGreeting.Greetings.Dev;
            }
        }

        let i = getRandomNumber(0, greetings.length - 1);
        return greetings[i];

    },

    /**
     * We grab a random user name (or any name if there is no other user)
     *
     * @param user
     * @returns {Object}
     */
    getRandomName: function (user) {

        let users = _Channel.getOnlineUsers(UserType.Human);

        if (users.length < 2) {
            users = [
                'Holgi', 'Shawn Mendes', 'Justin Bieber', 'Dieter Bohlen', 'Thomas Hayo', 'Jessica Lange', 'Katy Perry',
                'Ariane Grande', 'Sarah Connor', 'Guido Westerwelle', 'Adam Sandler', 'Ami Acker', 'Eva Habermann',
                'Angela Merkel', 'Cher', 'Jameline', 'Ami Acker', 'Stephen Hawking', 'Sabine Christiansen', 'Demi Moore',
                'Brad Pitt', 'Plex', 'Imagician', 'Madonna', 'Nicolas Cage', 'Jennifer Lopez', 'Miley Cyrus', 'Pink',
                'Claudia Schiffer', 'Mick Jagger', 'Simon Cowell', 'Zendaya', 'Alexander Calvert', 'Colin Ford', 'Oprah',
                'Rihanna', 'Sarah Shahi', 'Katy Perry'
            ];
        }

        let i = getRandomNumber(0, users.length - 1);
        let ruser = users[i];

        if (typeof ruser !== 'string') {
            if (ruser.getNick() === user.getNick()) {
                while (ruser.getNick() === user.getNick()) {
                    ruser = RandomOperations.getRandomObject(users);
                }
            }
        }

        return ruser;

    },

    /**
     * Do bot greeting
     *
     * @param user
     */
    doGreet: function (user) {

        // Check if bot is allowed to greet this user
        if (!this.shouldGreet(user)) {
            return;
        }

        let ruser = this.getRandomName(user);
        let msg = this.getGreetingMsg(user);
        let user_photo = '';
        if (user.hasProfilePhoto()) {
            user_photo = user.getProfilePhoto(100, 100);
        }
        msg = msg.formater({
            'USER': getFormatedUserProfileLink(user),
            'RUSER': ruser,
            'OWNER': getFormatedUserProfileLink(_ChOwners[0]),
            'ICON_MCM': '°>' + _IMG.Icons.MCM + '<°',
            'ICON_OWNER': '°>' + _IMG.Icons.Owner + '<°',
        });

        _Botuser.sendPublicMessage(msg);

    }

};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MBotGreeting = function (action) {

    if (action !== 'start') {
        return;
    }

    MBotGreeting.preload();

};

/**
 * Extends System OnJoinLeft
 *
 * @param user
 * @param action
 * @constructor
 */
OnJoinLeft.MBotGreeting = function (user, action) {

    if (action !== 'join') {
        return;
    }

    MBotGreeting.doGreet(user);

};

/**
 * ACP UI
 *
 * @type {{type: string, content: AppContent}}
 */
MACP.UI.botgreeting = {
    type: 'popup',
    content: AppContent.popupContent(new HTMLFile('/acp/cfg_botgreeting.html'), 650, 420)
};

/**
 * ACP UI Datas
 *
 * @returns {{IsActive: boolean, MaxUsers: number, IsUserGreetingActive: boolean, IsCMGreetingActive: boolean, IsOwnerGreetingActive: boolean, Greetings: {User: string, CM: string, Owner: string}}}
 */
MACP.ACPUIDatas.botgreeting = function () {

    let dataObject = {
        'IsActive': _CFG.BotGreeting.IsActive,
        'MaxUsers': _CFG.BotGreeting.MaxUsers,
        'IsUserGreetingActive': _CFG.BotGreeting.IsUserGreetingActive,
        'IsCMGreetingActive': _CFG.BotGreeting.IsCMGreetingActive,
        'IsOwnerGreetingActive': _CFG.BotGreeting.IsDevGreetingActive,
        'Greetings': {
            'User': '',
            'CM': '',
            'Owner': '',
        }
    };
    _CFG['BotGreeting']['Greetings']['User'].forEach(function (i, id, array) {
        dataObject.Greetings.User += i;
        if (id < array.length - 1) {
            dataObject.Greetings.User += '\n';
        }
    });
    _CFG['BotGreeting']['Greetings']['CM'].forEach(function (i, id, array) {
        dataObject.Greetings.CM += i;
        if (id < array.length - 1) {
            dataObject.Greetings.CM += '\n';
        }
    });
    _CFG['BotGreeting']['Greetings']['Owner'].forEach(function (i, id, array) {
        dataObject.Greetings.Owner += i;
        if (id < array.length - 1) {
            dataObject.Greetings.Owner += '\n';
        }
    });

    return dataObject;

};

/**
 * Checks new config and saves them
 *
 * @param user
 * @param datas
 * @constructor
 */
MACP.ConfigCheck.BotGreeting = function (user, datas) {

    if ('IsUserGreetingActive' in datas) {
        _CFG.BotGreeting.IsUserGreetingActive = !_CFG.BotGreeting.IsUserGreetingActive;
    }
    else if ('IsCMGreetingActive' in datas) {
        _CFG.BotGreeting.IsCMGreetingActive = !_CFG.BotGreeting.IsCMGreetingActive;
    }
    else if ('IsOwnerGreetingActive' in datas) {
        _CFG.BotGreeting.IsOwnerGreetingActive = !_CFG.BotGreeting.IsOwnerGreetingActive;
    }
    else {

        if (!isNaN(datas.MaxUsers)) {
            datas.MaxUsers = parseInt(datas.MaxUsers);
            if (datas.MaxUsers >= 1) {
                _CFG.BotGreeting.MaxUsers = datas.MaxUsers;
            }
            else {
                user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                    'msg': _LNG.BotGreeting.Error.Max_User_Is_Null
                });
                return;
            }
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.BotGreeting.Error.Is_NaN.formater({'KEY': 'Max. User'})
            });
            return;
        }

        if (isEmpty(datas.UserGreetings)) {
            _CFG.BotGreeting.Greetings.User = [];
        }
        else {
            _CFG.BotGreeting.Greetings.User = getEscapedString(datas['UserGreetings']).split(/\r|\n/);
        }

        if (isEmpty(datas.CMGreetings)) {
            _CFG.BotGreeting.Greetings.CM = [];
        }
        else {
            _CFG.BotGreeting.Greetings.CM = getEscapedString(datas['CMGreetings']).split(/\r|\n/);
        }

        if (isEmpty(datas.OwnerGreetings)) {
            _CFG.BotGreeting.Greetings.Owner = [];
        }
        else {
            _CFG.BotGreeting.Greetings.Owner = getEscapedString(datas['OwnerGreetings']).split(/\r|\n/);
        }

    }

    user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
        'msg': _LNG.System.General.Setings_Changed
    });

    CORE.reloadConfig();
    MACP.getUIDatas(user, datas.page);

};