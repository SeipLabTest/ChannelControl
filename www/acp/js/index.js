document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'index') {
        setACPIndexDatas(datas);
    }

    if (key === 'NOTICE') {
        setNotice(datas.msg);
    }

});

function setACPIndexDatas(datas) {

    $('#version').html(datas.Version);
    $('#installDate').text(datas.InstallDate);
    $('#users').text(datas.Users);
    $('#useableKnuddel').text(datas.Knuddel);
    $('#profit').text(datas.Profit);
    $('#restartDate').text(datas.LastRestart);
    $('#lastUpdate').text(datas.LastUpdate);

    let mActive = datas.Modules;

    let modules = [
        'Advertise',
        'Activity',
        'Blacklist',
        'Bot',
        'Botgreeting',
        'Botknuddel',
        'LoginBonus',
        'MuteNotify',
        'ReadmeRaffle',
        'StatusIcons'
    ];

    modules.forEach(function (item, index) {
        if (mActive[item]) {
            $('#badge' + item + 'Module').text('Aktiviert');
        }
        else {
            $('#badge' + item + 'Module').text('Deaktiviert');
        }
    });

}