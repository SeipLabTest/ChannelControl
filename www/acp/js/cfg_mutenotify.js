document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'mutenotify') {
        setBlacklistDatas(datas);
    }

    if (key === 'NOTICE') {
        setNotice(datas.msg);
    }

});

function setBlacklistDatas(datas) {
    if (datas.IsActive) {
        $('#module_status').text('An');
    }
    else {
        $('#module_status').text('Aus');
    }
}