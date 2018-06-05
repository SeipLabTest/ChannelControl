document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    let profileDatas = '';

    if ('CCTeam' in datas) {
        profileDatas += '<li class="list-group-item"><strong>ChannelControl-' + datas.CCTeam.Position + '</strong></li>' +
            '<li class="list-group-item"> ' + datas.CCTeam.Comment + ' </li>';
    }

    profileDatas += '<li class="list-group-item"><strong>Allgemein</strong></li>' +
        '<li class="list-group-item">Erster Besuch: ' + datas.FirstLoginTime + '</li>' +
        '<li class="list-group-item">Letzter Besuch: ' + datas.LastLoginTime + '</li>' +
        '<li class="list-group-item">Online-Zeit: ' + datas.Minutes + ' Minuten</li>' +
        '<li class="list-group-item">Aktivit&auml;ts-Level: ' + datas.ActivityLevel + ' (' + datas.PercentOfActivityLevel + '% von Level ' + (datas.ActivityLevel + 1) + ')</li>';

    if ('CM' in datas) {
        profileDatas += '<li class="list-group-item"><strong>CM-Infos</strong></li>';
        if (datas.CM.Mute.IsMuted) {
            profileDatas += '<li class="list-group-item"><strong>CM-Infos</strong></li>' +
                '<li class="list-group-item">Muted von: ' + datas.CM.Mute.By + '</li>' +
                '<li class="list-group-item">Mute-Grund: ' + datas.CM.Mute.Reason + '</li>' +
                '<li class="list-group-item">Mutedauer: ' + datas.CM.Mute.Duration + '</li>';
        }
        if (datas.CM.Mute.Count > 0) {
            profileDatas += '<li class="list-group-item">Mutes gesamt: ' + datas.CM.Mute.Count + '</li>';
        }

        if (datas.CM.Lock.IsLocked) {
            profileDatas += '<li class="list-group-item">Gesperrt von: ' + datas.CM.Lock.By + '</li>' +
                '<li class="list-group-item">Sperr-Grund: ' + datas.CM.Lock.Reason + '</li>' +
                '<li class="list-group-item">Sperrdauer: ' + datas.CM.Lock.Duration + '</li>';
        }
        if (datas.CM.Lock.Count > 0) {
            profileDatas += '<li class="list-group-item">Locks gesamt: ' + datas.CM.Lock.Count + '</li>';
        }

        if ('Owner' in datas) {
            profileDatas += '<li class="list-group-item"><strong>Owner-Infos</strong></li>' +
                '<li class="list-group-item">Wahl-Nominiert: ' + datas.Owner.Election.IsNominated + '</li>' +
                '<li class="list-group-item">F&uuml;r Wahlen gesperrt: ' + datas.Owner.Election.IsLocked + '</li>' +
                '<li class="list-group-item">Aussortiert: ' + datas.Owner.Election.IsSortedOut + '</li>';
        }

    }

    $('#userDatas').html(profileDatas);
    $('#profileHead').html('Profile von ' + datas.UserName);

});