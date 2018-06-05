function getFormatedUserProfileLink(user) {

    let userlink = user.getProfileLink();

    if (user.isAppDeveloper() || user.isChannelOwner() || user.isAppManager() || user.isEventModerator() || user.isChannelModerator()) {
        userlink = '°BB°_' + userlink + '§';
    }

    return userlink;

}