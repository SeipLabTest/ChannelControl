/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 25.05.2018
 * @version: 1.1.0
 * @app: ChannelControl 3
 * @system: AppUser
 */

let AUser = {

    isNewUser: function (user) {

        return !user.getPersistence().hasObject('User');

    },

    createUser: function (user) {

        if (!this.isNewUser(user)) {
            return;
        }

        user.getPersistence().setObject('User', {
            'FirstLoginTime': Date.now(),
            'LastLoginTime': Date.now(),
            'Minutes': 0,
            'LoginCount': {
                'Total': 1,
                'InRow': 0,
                'LastRow': 0,   // timestamp 00:00:01
            },
            'TopList': {
                'Activity': {
                    'Level': 1,
                    'Points': 0,
                    'Hours': 0,
                }
            },
            'Mute': {
                'IsMuted': false,
                'Reason': '',
                'By': 0,
                'Duration': 0,
                'Count': 0
            },
            'Lock': {
                'IsLocked': false,
                'Reason': '',
                'By': 0,
                'Duration': 0,
                'Count': 0
            },
            'Comments': {
                'Comment': [],
                'By': [],
                'Date': [],
            },
            'Election': {
                'IsNominated': false,
                'HasNominated': false,
                'IsTested': false,
                'TestAttempts': 0,
                'IsLocked': false,
                'IsSortedOut': false,
                'Votes': 0,
                'Voted': {
                    'Positives': 0,
                    'Negatives': 0,
                    'VoteDatas': {}, // 'NICK': COUNTER
                }
            },
            'Newsletter': {
                'SignOn': false,
            },
        });

        if (user.getUserType() === UserType.Human) {
            user.getPersistence().setNumber('ActivityLevel', 1);
        }

        _Botuser.sendPrivateMessage(_LNG.System.General.Privacy_Disclaimer, user);

    },

    deleteUser: function (username) {

        let user = _User.getUserById(_User.getUserId(username));

        user.getPersistence().deleteAll();

    },

    getUserDatas: function (user) {

        return user.getPersistence().getObject('User');

    },

    isExisting: function (user) {

        if (typeof user === 'string') {
            if (!_User.exists(user)) {
                return false;
            }
            user = _User.getUserById(_User.getUserId(user));
        }

        if (user === null) {
            return false;
        }

        if (!_User.mayAccess(user.getUserId())) {
            return false;
        }

        if (!_User.exists(user.getNick())) {
            return false;
        }

        if (this.isNewUser(user)) {
            return false;
        }

        return true;

    },

    isCCTeam: function (user) {

        return user.isAppDeveloper();

    },

};

OnStartStop.User = function (action) {

    if (action === 'start') {
        let users = _Channel.getOnlineUsers(UserType.Human);
        if (users.length > 0) {
            for (let i = 0; i < users.length; i++) {
                if (AUser.isNewUser(users[i])) {
                    AUser.createUser(users[i]);
                }
            }
        }
    }

};

OnJoinLeft.User = function (user, action) {

    if (action === 'join') {
        if (AUser.isNewUser(user)) {
            AUser.createUser(user);
        }
        else {
            let userDatas = user.getPersistence().getObject('User');
            userDatas.LoginCount.Total += 1;
            user.getPersistence().setObject('User', userDatas);
        }
    }

    if (action === 'left') {
        if (user.isAppDeveloper()) {
            _Botuser.sendPrivateMessage('Lösche deine Daten: °>/pp ' + _Botuser.getNick() + ':.exec AUser.deleteUser(' + user.getNick + ');|/pp ' + _Botuser.getNick() + ':.exec AUser.deleteUser(' + user.getNick + ');<°', user);
        }
    }

};