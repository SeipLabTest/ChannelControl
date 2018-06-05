/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 20.04.2018
 * @version: 1.1.1
 * @app: ChannelControl 3
 * @module: Topic Changer
 */

let MTopicChanger = {

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
                '.topic delete - um das Channelthema vollständig zu löschen',
                '.topic preview:TEXT - um eine Vorschau von TEXT als Channelthema zu erhalten',
                '.topic set:TEXT - um TEXT als neues Channelthema zu setzen',
                '.topic expand:TEXT - um TEXT zum aktuellem Channelthema hinzuzufügen'
            ],
        ];
        CORE.registerLanguages('TopicChanger', 'Help', langs);

        // Register General Messages
        langs['keys'] = [
            'CMD_Topic_Preview',
            'CMD_Topic_Set',
            'CMD_Topic_Expanded',
            'CMD_Topic_Deleted'
        ];
        langs['items'] = [
            '°BB°_Dieser Channel hat folgendes Thema:§_°#°',
            'Das Thema wurde erfolgreich geändert!',
            'Das Thema wurde erfolgreich erweitert!',
            'Das Thema wurde erfolgreich gelöscht!'
        ];
        CORE.registerLanguages('TopicChanger', 'General', langs);

    },

    /**
     * Check if user is allowed to use this command
     *
     * @param user
     * @returns {boolean}
     */
    allowed: function (user) {

        return !(!user.isEventModerator() && !user.isAppManager() && !user.isChannelOwner());

    },

    /**
     * Send help message to user
     *
     * @param user
     * @param params
     * @param cmd
     */
    help: function (user, params, cmd) {

        let msg = _LNG.TopicChanger.Help.Usage;

        _LNG.TopicChanger.Help.UsageCMDs.forEach(function (item) {
            msg += item + '°#°';
        });

        _Botuser.sendPrivateMessage(msg, user);

    },

    /**
     * Send a preview
     *
     * @param user
     * @param params
     * @param cmd
     */
    preview: function (user, params, cmd) {

        if (isEmpty(params)) {
            this.help(user);
            return;
        }

        _Botuser.sendPrivateMessage(_LNG.TopicChanger.General.CMD_Topic_Preview + this.getFormatedTopic(params), user);

    },

    /**
     * Set new topic
     *
     * @param user
     * @param params
     * @param cmd
     */
    set: function (user, params, cmd) {

        if (isEmpty(params)) {
            this.help(user);
            return;
        }

        _Logger.info(user.getNick() + ' ändert Thema zu ' + params);
        _Channel.getChannelConfiguration().getChannelInformation().setTopic(this.getFormatedTopic(params));
        _Botuser.sendPrivateMessage(_LNG.TopicChanger.General.CMD_Topic_Set, user);

        this.addBrandToTopic();

    },

    /**
     * Expands topic
     *
     * @param user
     * @param params
     * @param cmd
     */
    expand: function (user, params, cmd) {

        if (isEmpty(params)) {
            this.help(user);
            return;
        }

        let currentTopic = _Channel.getChannelConfiguration().getChannelInformation().getTopic();
        let newTopic = currentTopic + params;
        _Logger.info(user.getNick() + ' erweitert Thema um ' + params);
        _Channel.getChannelConfiguration().getChannelInformation().setTopic(this.getFormatedTopic(newTopic));
        _Botuser.sendPrivateMessage(_LNG.TopicChanger.General.CMD_Topic_Expanded, user);

    },

    /**
     * Delete topic
     *
     * @param user
     * @param params
     * @param cmd
     */
    delete: function (user, params, cmd) {

        _Logger.info(user.getNick() + ' löscht Channelthema');
        _Channel.getChannelConfiguration().getChannelInformation().setTopic('');
        _Botuser.sendPrivateMessage(_LNG.TopicChanger.General.CMD_Topic_Deleted, user);

    },

    /**
     * Replace placeholders in topic
     *
     * @param topic
     * @returns {string}
     */
    getFormatedTopic: function (topic) {

        return topic.formater({
            'LINK_SET_README': '°>Readme setzen und Knuddel gewinnen|/readme ' + _CFG.ReadmeRaffle.KeyText + ' <°',
            'LINK_SET_LMC': '°>LMC setzen|/edit setlmc<°',
            'LINK_GET_HELP': '°>ChannelControl-Hilfe|/p ' + _Botuser.getNick() + ':.help<°',
            'LINK_GET_NUTSHELL_GAME': '°>Nutshell-Game|/p ' + _Botuser.getNick() + ':.nutshell<°',
            'LINK_GET_GREEDY_PIG': '°>Greedy Pig|/p ' + _Botuser.getNick() + ':.greedy<°',
            'BTN_SET_README': '°>{button}Readme setzen und Knuddel gewinnen!|0|call|/readme ' + _CFG.ReadmeRaffle.KeyText + ' <°',
            'BTN_SET_LMC': '°>{button}LMC setzen||call|/edit setlmc<°',
            'BTN_GET_HELP': '°>{button}ChannelControl-Hilfe||call|/p ' + _Botuser.getNick() + ':.help<°',
            'BTN_GET_NUTSHELL_GAME': '°>{button}Nutshell-Game||call|/p ' + _Botuser.getNick() + ':.nutshell<°',
            'BTN_GET_GREEDY_PIG': '°>{button}Greedy Pig||call|/p ' + _Botuser.getNick() + ':.greedy<°',
        });

    },

    addBrandToTopic: function () {

        if (_Channel.getChannelName() === '/Pferderennen') {

            let oldbrand = '§_°BB°°>Powered by ChannelControl|https://knuddels-wiki.de/index.php?title=User_App:ChannelControl<°';
            let brand = '§_°BB°°>Powered by ChannelControl|https://seiplab.de/forum/board/5-channelcontrol-3/<°';
            let topic = _Channel.getChannelConfiguration().getChannelInformation().getTopic();

            if (topic.search(oldbrand) > -1) {
                let newtopic = topic.replace(oldbrand, brand);
                this.set(_Botuser, topic, '');
            }

            if (topic.search(brand) === -1) {

                brand = '°#°°#°' + brand;
                this.expand(_Botuser, brand, '');
            }

        }

    },

};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MTopicChanger = function (action) {

    if (action !== 'start') {
        return;
    }

    MTopicChanger.preload();
    MTopicChanger.addBrandToTopic();

};

/**
 * Extends System ChatCommands
 *
 * @param user
 * @param cmd
 * @param params
 */
ChatCommands.topic = function (user, cmd, params) {

    if (!MTopicChanger.allowed(user)) {
        _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
        return;
    }

    if (isEmpty(params)) {
        params = 'help';
    }

    params = params.split(':');

    if (!(params[0].toLowerCase() in MTopicChanger)) {
        params[0] = 'help';
    }

    params[1] = mergeSplitString(params, 2, ':');

    MTopicChanger[params[0].toLowerCase()](user, params[1], cmd);

};

App.chatCommands['.topic'] = function (user, params, cmd) {
    ChatCommands.topic(user, cmd, params);
};