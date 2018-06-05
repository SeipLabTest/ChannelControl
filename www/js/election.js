document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;
    let info = '';

    switch (datas.status) {
        case 0:
            info = 'Zur Zeit finden <strong>keine Wahlen</strong> statt!';
            break;
        case 1:
            info = 'Zur Zeit findet die <strong>Nominierungsphase</strong> statt!';
            break;
        case 2:
            info = 'Du hast noch <strong>' + datas.votes.pos + ' positive Stimmen</strong> und ' +
                '<strong>' + datas.votes.neg + ' negative Stimmen</strong>.';
            break;
    }
    $('#ElectionInfos').html(info);

    if (datas.list.length > 0) {

        let listOfCandidates = '';

        datas.list.forEach(function (item, index) {

            if (datas.status === 2) {
                listOfCandidates +=
                    '<tr>' +
                    '<td style="padding-bottom: 0px;">' + item + '</td>' +
                    '<td style="padding-bottom: 0px;"><button class="btn btn-sm btn-primary" onclick="vote(\'' + item + '\', \'pos\');return false;">+1</button></td>' +
                    '<td style="padding-bottom: 0px;"><button class="btn btn-sm btn-danger" onclick="vote(\'' + item + '\', \'neg\');return false;">-1</button></td>' +
                    '</tr>';
            }
            else {
                listOfCandidates +=
                    '<tr>' +
                    '<td style="padding-bottom: 0px;">' + item + '</td>' +
                    '<td style="padding-bottom: 0px;"><button class="btn btn-sm btn-primary disabled">+1</button></td>' +
                    '<td style="padding-bottom: 0px;"><button class="btn btn-sm btn-danger disabled">-1</button></td>' +
                    '</tr>';
            }
        });

        $('tbody').html(listOfCandidates);

    }

});

function vote(username, op) {
    Client.sendEvent('election', {'target': username, 'op': op});
}