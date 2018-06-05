/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 25.03.2018
 * @version: 1.2.0
 * @app: ChannelControl 3
 * @module: TopActivity
 */

let MTopActivity = {

    /**
     * Create top list
     */
    createTopList: function () {

        let toplist = KnuddelsServer.getToplistAccess().createOrUpdateToplist('ActivityLevel', 'Aktivitätslevel');
        KnuddelsServer.getAppProfileEntryAccess().createOrUpdateEntry(toplist, ToplistDisplayType.ValueAndRank);

    },

    /**
     * Delete top list
     */
    deleteTopList: function () {

        KnuddelsServer.getToplistAccess().removeToplist(KnuddelsServer.getToplistAccess().getToplist('ActivityLevel'));

    },


    /**
     * Set top list level of user
     *
     * @param user
     */
    setLevel: function (user) {

        if (user.getUserType() !== UserType.Human) {
            return;
        }

        let userDatas = AUser.getUserDatas(user);
        // Calculate points to next level.
        let neededPoints = this.getNextLevelPoints(userDatas.TopList.Activity.Level);

        if (userDatas.TopList.Activity.Points / neededPoints >= 1.0) {
            userDatas.TopList.Activity.Points -= neededPoints;
            userDatas.TopList.Activity.Level += 1;
            user.getPersistence().setObject('User', userDatas);
            user.getPersistence().addNumber('ActivityLevel', 1);
        }

    },

    getNextLevelPoints: function (level) {
        return Math.ceil(100 + 0.33 * Math.pow(level + 1, 4));
    },

    /**
     * Add activity points
     *
     * @param user
     * @param action
     */
    addPoints: function (user, action) {

        let userDatas = AUser.getUserDatas(user);
        let userHours = Math.floor(userDatas.Minutes / 60);

        userDatas.TopList.Activity.Points = _CFG.TopList.Activity.Points.Hours * userHours;
        userDatas.TopList.Activity.Hours = userHours;

        switch (action) {
            case 'msg':
                userDatas.TopList.Activity.Points += _CFG.TopList.Activity.Points.Msg;
                break;
            case 'kiss':
                userDatas.TopList.Activity.Points += _CFG.TopList.Activity.Points.Kiss;
                break;
            case 'knuddel':
                userDatas.TopList.Activity.Points += _CFG.TopList.Activity.Points.Knuddel;
                break;
            case 'gaming':
                userDatas.TopList.Activity.Points += _CFG.TopList.Activity.Points.Gaming;
                break;
        }

        user.getPersistence().setObject('User', userDatas);
        this.setLevel(user);

    }

};

/**
 * Extends System OnStartStop
 *
 * @param action
 * @constructor
 */
OnStartStop.MTopActivity = function (action) {

    if (action !== 'start') {
        return;
    }

    MTopActivity.createTopList();

    if (!_CFG.TopList.Activity.IsActive) {
        MTopActivity.deleteTopList();
        return;
    }

    let users = _Channel.getOnlineUsers(UserType.Human);

    for (let i = 0; i < users.length; i++) {
        let userDatas = AUser.getUserDatas(users[i]);
        userDatas.LastLoginTime = Date.now();
        users[i].getPersistence().setObject('User', userDatas);
    }

};

/**
 * Extends System PublicMsgReaction (OnMessage)
 *
 * @param user
 * @param msg
 * @constructor
 */
PublicMsgReaction.MTopActivity = function (user, msg) {

    if (msg.split(" ").join("").length < 7) {
        return;
    }

    MTopActivity.addPoints(user, 'msg');

};

/**
 * Extends OnJoinLeft
 *
 * @param user
 * @param action
 * @constructor
 */
OnJoinLeft.MTopActivity = function (user, action) {

    let userDatas = AUser.getUserDatas(user);

    if (action === 'join') {
        userDatas.LastLoginTime = Date.now();
    }

    if (action === 'left') {
        let difference = Date.now() - userDatas.LastLoginTime;
        let minutes = difference / (60 * 1000);
        minutes = Math.floor(minutes);
        userDatas.Minutes += minutes;
    }

    user.getPersistence().setObject('User', userDatas);

};

MACP.UI.toplist_activity = {
    type: 'popup',
    content: AppContent.popupContent(new HTMLFile('/acp/cfg_toplist_activity.html'), 650, 420)
};

MACP.ACPUIDatas.toplist_activity = function () {

    let dataObject = {
        'IsActive': _CFG.TopList.Activity.IsActive,
    };
    return dataObject;

};