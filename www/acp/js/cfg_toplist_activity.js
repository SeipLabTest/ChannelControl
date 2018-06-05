document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'toplist_activity') {
        setTopListActivityDatas(datas);
    }

    if (key === 'NOTICE') {
        setNotice(datas.msg);
    }

});

function setTopListActivityDatas(datas) {
    if (datas.IsActive) {
        $('#module_status').text('An');
    }
    else {
        $('#module_status').text('Aus');
    }
}