document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'statusicons') {
        setStatusIconDatas(datas);
    }

    if (key === 'NOTICE') {
        setNotice(datas.msg);
    }

});

function setStatusIconDatas(datas) {

    if (datas.IsActive) {
        $('#module_status').text('An');
    }
    else {
        $('#module_status').text('Aus');
    }

    if (datas.IsOwnerIconActive) {
        $('#module_ownericon').text('An');
    }
    else {
        $('#module_ownericon').text('Aus');
    }

    if (datas.IsLMCIconActive) {
        $('#module_lmcicon').text('An');
    }
    else {
        $('#module_lmcicon').text('Aus');
    }

}