function getUI(key, content) {
    Client.sendEvent(key, {'content': content});
}

function switchConfig(module, sub, page) {

    let datas = {
        'action': 'switch',
        'module': module,
        'sub': sub,
        'page': page
    };

    Client.sendEvent('config', datas);
}

function sendSettings(datas) {
    Client.sendEvent('config', datas);
}

function setNotice(msg) {
    $('#NOTICE').addClass('bg-info');
    $('#NOTICE').text(msg);
}

function setNavigation() {

    let nav = '' +
        '<li> ' +
        '<a href="#" onclick="getUI(\'acp_index\', \'advertise\')">Advertise</a> ' +
        '</li> ' +
        '<li> ' +
        '<a href="#" onclick="getUI(\'acp_index\', \'toplist_activity\')">Aktivit&auml;t</a> ' +
        '</li> ' +
        '<li> ' +
        '<a href="#" onclick="getUI(\'acp_index\', \'blacklist\')">Blacklist</a> ' +
        '</li> ' +
        '<li> ' +
        '<a href="#" onclick="getUI(\'acp_index\', \'bot\')">Bot</a> ' +
        '</li> ' +
        '<li> ' +
        '<a href="#" onclick="getUI(\'acp_index\', \'botgreeting\')">Botgreeting</a> ' +
        '</li> ' +
        '<li> ' +
        '<a href="#" onclick="getUI(\'acp_index\', \'botknuddel\')">Botknuddel</a> ' +
        '</li> ' +
        '<li> ' +
        '<a href="#" onclick="getUI(\'acp_index\', \'loginbonus\')">Login-Bonus</a> ' +
        '</li> ' +
        '<li> ' +
        '<a href="#" onclick="getUI(\'acp_index\', \'mutenotify\')">Mute-Notify</a> ' +
        '</li> ' +
        '<li> ' +
        '<a href="#" onclick="getUI(\'acp_index\', \'newsletter\')">Auto-Newsletter</a> ' +
        '</li> ' +
        '<li> ' +
        '<a href="#" onclick="getUI(\'acp_index\', \'readmeraffle\')">Readme-Verlosung</a> ' +
        '</li> ' +
        '<li> ' +
        '<a href="#" onclick="getUI(\'acp_index\', \'statusicons\')">Status-Icons</a> ' +
        '</li>';

    $('#demo').html(nav);

}