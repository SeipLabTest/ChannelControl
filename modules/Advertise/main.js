/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 10.10.2017
 * @version: 1.0.0
 * @app: ChannelControl 3
 * @module: Advertise
 */

/**
 * @type {{intvall: MAdvertise.intvall}}
 */
let MAdvertise = {

    /**
     * Preload configs / languages
     */
    preload: function () {

        let langs = ['keys', 'items'];

        // Register Error Messages
        langs['keys'] = [
            'Intervall_Is_Null',
            'Is_NaN',
        ];
        langs['items'] = [
            'Der Intervall darf nicht kleiner als 1 sein.',
            '$KEY ist keine Zahl.'
        ];
        CORE.registerLanguages('Advertise', 'Error', langs);

    },

    /**
     * Starts intervall to post advertise messages automatically
     */
    intvall: function () {

        // Check if advertise module is active
        if (_CFG.Advertise.IsActive && _CFG.Advertise.Message.length > 0 && _CFG.Advertise.LastIntervall + (_CFG.Advertise.Intervall * 1000 * 60) < Date.now()) {

            let msg = '';

            // Grab a random advertise message
            while (isEmpty(msg)) {
                let i = getRandomNumber(0, _CFG.Advertise.Message.length - 1);
                msg = _CFG.Advertise.Message[i];
            }

            // Send msg
            _Botuser.sendPublicMessage('"' + msg + '"');

            _CFG.Advertise.LastIntervall = Date.now();

        }

    }

};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MAdvertise = function (action) {

    if (action === 'start') {
        MAdvertise.preload();
    }

};

/**
 * Extends System Cronjob
 *
 * @constructor
 */
Cronjob.MAdvertise = function () {
    MAdvertise.intvall();
};

/**
 * ACP UI
 * @type {{type: string, content: AppContent}}
 */
MACP.UI.advertise = {
    type: 'popup',
    content: AppContent.popupContent(new HTMLFile('/acp/cfg_advertise.html'), 650, 420)
};

/**
 * ACP UI Datas
 * @returns {{IsActive: boolean, Intervall: number, Messages: string}}
 */
MACP.ACPUIDatas.advertise = function () {

    let dataObject = {
        'IsActive': _CFG.Advertise.IsActive,
        'Intervall': _CFG.Advertise.Intervall,
        'Messages': '',
    };
    _CFG['Advertise']['Message'].forEach(function (i, id, array) {
        dataObject.Messages += i;
        if (id < array.length - 1) {
            dataObject.Messages += '\n';
        }
    });

    return dataObject;

};

/**
 * Check and save given config
 *
 * @param user
 * @param datas
 * @constructor
 */
MACP.ConfigCheck.Advertise = function (user, datas) {

    if (!isNaN(datas.intervall)) {
        datas.intervall = parseFloat(datas.intervall);
        if (datas.intervall >= 1) {
            _CFG.Advertise.Intervall = datas.intervall;
        }
        else {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
                'msg': _LNG.Advertise.Error.Intervall_Is_Null,
            });
            return;
        }
    }
    else {
        user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
            'msg': _LNG.Advertise.Error.Is_NaN.formater({'KEY': 'Intervall'}),
        });
        return;
    }

    if (isEmpty(datas.messages)) {
        _CFG.Advertise.Message = [];
    }
    else {
        let ads = getEscapedString(datas.messages);
        _CFG.Advertise.Message = ads.split(/\r|\n/);
    }

    user.getAppContentSession(AppViewMode.Popup).sendEvent('NOTICE', {
        'msg': _LNG.System.General.Setings_Changed
    });

    CORE.reloadConfig();
    MACP.getUIDatas(user, datas.page);

};