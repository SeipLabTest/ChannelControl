document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'newsletter') {
        if (datas.IsActive) {
            $('#module_status').text('An');
        }
        else {
            $('#module_status').text('Aus');
        }

        $('input[id="module_intervall"]').val(datas.Intervall);
        $('input[id="module_subject"]').val(datas.Subject);
        $("textarea#module_messages").val(datas.Message);

    }

    if (key === 'NOTICE') {
        setNotice(datas.msg);
    }

});