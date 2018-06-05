/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 11.10.2017
 * @version: 1.0.0
 * @app: ChannelControl 3
 * @system: OnStartStop
 */

let OnStartStop = {

    handler: function (action) {

        let O = OnStartStop;
        Object.keys(O).forEach(function (key) {
            if (key !== 'handler') {
                O[key](action);
            }
        });

    },

};