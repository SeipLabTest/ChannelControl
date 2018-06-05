/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 16.10.2017
 * @version: 1.0.0
 * @app: ChannelControl 3
 * @system: Cronjob
 */

let Cronjob = {

    main: function () {
        setInterval(function () {

            let O = Cronjob;

            Object.keys(O).forEach(function (key) {
                if (key !== 'main') {
                    O[key]();
                }
            });

        }, 30 * 1000);
    },

};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.Cronjob = function (action) {

    if (action !== 'start') {
        return;
    }

    Cronjob.main();

};