document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'advertise') {
        setAdvertiseDatas(datas);
    }

    if (key === 'NOTICE') {
        setNotice(datas.msg);
    }

});

function setAdvertiseDatas(datas) {

    if (datas.IsActive) {
        $('#module_status').text('An');
    }
    else {
        $('#module_status').text('Aus');
    }

    $('input[id="module_intervall"]').val(datas.Intervall);
    $("textarea#module_advertise_messages").val(datas.Messages);

}