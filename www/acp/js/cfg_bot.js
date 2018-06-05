document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'bot') {
        setBotDatas(datas);
    }

    if (key === 'NOTICE') {
        setNotice(datas.msg);
    }

});

function setBotDatas(datas) {

    if (datas.IsMuted) {
        $('#module_bot_ismuted').text('An');
    }
    else {
        $('#module_bot_ismuted').text('Aus');
    }

    if (datas.IsEventMode) {
        $('#module_bot_iseventmode').text('An');
    }
    else {
        $('#module_bot_iseventmode').text('Aus');
    }

}