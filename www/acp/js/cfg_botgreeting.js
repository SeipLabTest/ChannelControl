document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'botgreeting') {
        setBotGreetingDatas(datas);
    }

    if (key === 'NOTICE') {
        setNotice(datas.msg);
    }

});

function setBotGreetingDatas(datas) {

    if (datas.IsActive) {
        $('#module_status').text('An');
    }
    else {
        $('#module_status').text('Aus');
    }

    if (datas.IsUserGreetingActive) {
        $('#module_usergreeting').text('An');
    }
    else {
        $('#module_usergreeting').text('Aus');
    }

    if (datas.IsCMGreetingActive) {
        $('#module_cmgreeting').text('An');
    }
    else {
        $('#module_cmgreeting').text('Aus');
    }

    if (datas.IsOwnerGreetingActive) {
        $('#module_ownergreeting').text('An');
    }
    else {
        $('#module_ownergreeting').text('Aus');
    }

    $('input[id="module_maxusers"]').val(datas.MaxUsers);
    $("textarea#module_usermessages").val(datas.Greetings.User);
    $("textarea#module_cmmessages").val(datas.Greetings.CM);
    $("textarea#module_ownermessages").val(datas.Greetings.Owner);

}