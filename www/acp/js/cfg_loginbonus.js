document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'loginbonus') {
        setLoginBonusDatas(datas);
    }

    if (key === 'NOTICE') {
        setNotice(datas.msg);
    }

});

function setLoginBonusDatas(datas) {

    if (datas.IsActive) {
        $('#module_status').text('An');
    }
    else {
        $('#module_status').text('Aus');
    }

    $('input[id="module_basevalue"]').val(datas.BaseValue);
    $('input[id="module_maxmultiply"]').val(datas.MaxMultiply);
    $('input[id="module_intervall"]').val(datas.Intervall);
    $("#module_minstatus").val(datas.UserMinStatus).change();

}