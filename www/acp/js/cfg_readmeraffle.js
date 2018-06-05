document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'readmeraffle') {
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

    $("#module_minstatus").val(datas.MinStatus).change();
    $('input[id="module_intervall"]').val(datas.Intervall);
    $('input[id="module_maxwinner"]').val(datas.MaxWinner);
    $('input[id="module_price"]').val(datas.KnuddelPerWinner);
    $('input[id="module_keytext"]').val(datas.KeyText);

}