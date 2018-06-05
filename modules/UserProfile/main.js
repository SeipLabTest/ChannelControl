/**
 * @copyright: 2018 seiplab.de
 * @license: MIT License
 * @founder: W a n n a b e - M o d e l
 * @date: 01.05.2018
 * @version: 1.2.0
 * @app: ChannelControl 3
 * @module: UserProfile
 */

let MUserProfile = {

    getProfileDatas: function (user, targetname) {
        let profileDatas = {};
        let target = _User.getUserById(_User.getUserId(targetname));
        let targetDatas = target.getPersistence().getObject('User');

        profileDatas = {
            'UserName': target.getNick(),
            'FirstLoginTime': timestampToDate(targetDatas.FirstLoginTime, 0),
            'LastLoginTime': timestampToDate(targetDatas.LastLoginTime, 0),
            'Minutes': targetDatas.Minutes,
            'LoginCount': targetDatas.LoginCount.Total,
            'ActivityLevel': target.getPersistence().getNumber('ActivityLevel'),
            'PercentOfActivityLevel': 0,
        };

        profileDatas.PercentOfActivityLevel = parseInt(100 - (((MTopActivity.getNextLevelPoints(profileDatas.ActivityLevel) - targetDatas.TopList.Activity.Points) / MTopActivity.getNextLevelPoints(profileDatas.ActivityLevel)) * 100));

        if (user.isChannelModerator() || user.isChannelOwner() || user.isAppManager() || user.isAppDeveloper()) {
            profileDatas.CM = {
                'Mute': {
                    'IsMuted': targetDatas.Mute.IsMuted,
                    'Reason': targetDatas.Mute.Reason,
                    'By': _User.getUserById(targetDatas.Mute.By).getNick(),
                    'Duration': timestampToDate(targetDatas.Mute.Duration, 0),
                    'Count': targetDatas.Mute.Count
                },
                'Lock': {
                    'IsLocked': targetDatas.Lock.IsLocked,
                    'Reason': targetDatas.Lock.Reason,
                    'By': _User.getUserById(targetDatas.Lock.By).getNick(),
                    'Duration': timestampToDate(targetDatas.Lock.Duration, 0),
                    'Count': targetDatas.Lock.Count
                },
            };

            if (targetDatas.Lock.Duration === 0) {
                profileDatas.CM.Lock.Duration = 'Permanent'
            }

            if (targetDatas.Mute.Duration === 0) {
                profileDatas.CM.Mute.Duration = 'Tages-Ende'
            }

            if (user.isChannelOwner() || user.isAppManager() || user.isAppDeveloper()) {
                profileDatas.Owner = {
                    'Election': {
                        'IsNominated': targetDatas.Election.IsNominated ? 'Ja' : 'Nein',
                        'IsLocked': targetDatas.Election.IsLocked ? 'Ja' : 'Nein',
                        'IsSortedOut': targetDatas.Election.IsSortedOut ? 'Ja' : 'Nein',
                    }
                }
            }
        }

        return profileDatas;

    },

    getUI: function (user, targetname) {

        let contentDatas = {
            type: 'popup',
            content: AppContent.popupContent(new HTMLFile('/profile.html'), 650, 420),
        };

        if (user.canSendAppContent(contentDatas.content)) {
            user.sendAppContent(contentDatas.content);
            this.getUIDatas(user, targetname);
        }
        else {
            _Botuser.sendPrivateMessage(_LNG.System.Error.UI_Device_Problems, user);
        }

    },

    getUIDatas: function (user, targetname) {

        if (user.getAppContentSession(AppViewMode.Popup)) {
            user.getAppContentSession(AppViewMode.Popup).sendEvent('profile', this.getProfileDatas(user, targetname));
        }

    }

};

/**
 * Extends System ChatCommands
 *
 * @param user
 * @param cmd
 * @param params
 */
ChatCommands.profile = function (user, cmd, params) {

    if (isEmpty(params)) {
        params = user.getNick();
    }

    if (params.contains(':')) {
        params = params.split(':');
        if (params[0].toLowerCase() === 'delete' && AUser.isExisting(params[1])) {
            let target = _User.getUserById(_User.getUserId(params[1]));
            if (!user.isChannelOwner()) {
                _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
                return false;
            }
            if (target.isOnlineInChannel()) {
                _Botuser.sendPrivateMessage(target + ' darf für diese Aktion nicht im Channel anwesend sein.', user);
                return false;
            }
            AUser.deleteUser(target);
            _Botuser.sendPrivateMessage(target.getNick() + '\'s Daten wurden gelöscht.', user);
            return true;
        }
        if (params[0].toLowerCase() === 'datas' && AUser.isExisting(params[1])) {
            if (!user.isChannelOwner()) {
                _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
                return false;
            }
            let target = _User.getUserById(_User.getUserId(params[1]));
            _Botuser.sendPrivateMessage('Alle gespeicherten Daten von ' + target.getNick() + '°#°' +
                JSON.stringify(target.getPersistence().getObject('User')), user);
            return true;
        }
    }

    if (!AUser.isExisting(params)) {
        _Botuser.sendPrivateMessage(_LNG.System.Error.User_Does_Not_Exist, user);
        return false;
    }

    MUserProfile.getUI(user, params);

};

App.chatCommands['.profile'] = function (user, params, cmd) {
    ChatCommands.profile(user, cmd, params);
};