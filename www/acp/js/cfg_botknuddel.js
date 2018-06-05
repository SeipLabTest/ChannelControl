document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'botknuddel') {
        setBotknuddelDatas(datas);
    }

    if (key === 'NOTICE') {
        setNotice(datas.msg);
    }

});

function setBotknuddelDatas(datas) {

    if (datas.IsActive) {
        $('#module_status').text('An');
    }
    else {
        $('#module_status').text('Aus');
    }

    $('input[id="module_intervall"]').val(datas.Intervall);
    $('input[id="module_minuser"]').val(datas.MinUsers);
    $('input[id="module_minknuddel"]').val(datas.MinKnuddel);
    $('input[id="module_maxknuddel"]').val(datas.MaxKnuddel);

}