document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'NewGame') {
        let select = '';
        /*
        for(let i = datas.MinKnuddel; i - 1 < datas.MaxKnuddel; i++) {
            select += '<option value=' + i + '>' + i + '</option>';
        }
        */
        $('#kn_value').val(datas.MinKnuddel);
        _min = datas.MinKnuddel;
        _max = datas.MaxKnuddel;

        if (datas.Channelname === '/Pferderennen') {
            $('.navbar-brand').text(datas.Channelname.replace('/', ''));
        }

    }

    if (key === 'Update') {
        $('#NOTICE').empty();
        _wait = true;

        let img_with_knuddel = '<img src="images/games/nutshell/nutshell_with_knuddel.png" class="rounded mx-auto d-block" alt="Closed Nutshell Image" width="80" height="50"/>';
        let img_without_knuddel = '<img src="images/games/nutshell/nutshell_without_knuddel.png" class="rounded mx-auto d-block" alt="Closed Nutshell Image" width="80" height="50"/>';
        let img_closed_nutshell = '<img src="images/games/nutshell/nutshell_closed.png" class="rounded mx-auto d-block" alt="Closed Nutshell Image" width="80" height="50"/>';

        switch (datas.Number) {
            case 1:
                $('#1').html(img_with_knuddel);
                $('#2').html(img_without_knuddel);
                $('#3').html(img_without_knuddel);
                break;
            case 2:
                $('#1').html(img_without_knuddel);
                $('#2').html(img_with_knuddel);
                $('#3').html(img_without_knuddel);
                break;
            case 3:
                $('#1').html(img_without_knuddel);
                $('#2').html(img_without_knuddel);
                $('#3').html(img_with_knuddel);
                break;
        }

        setTimeout(function () {
            $('#1').html(img_closed_nutshell);
            $('#2').html(img_closed_nutshell);
            $('#3').html(img_closed_nutshell);
            _wait = false;
        }, 2500);

    }

    if (key === 'NOTICE') {
        $('#NOTICE').html(datas.Msg);
    }

});

function select(id) {

    if (!_wait) {
        let amount = $('#kn_value').val();

        if (isNaN(amount)) {
            $('#NOTICE').html('Dies ist kein gültiger Einsatz.');
            return;
        }

        if (amount < _min) {
            $('#NOTICE').html('Der Mindest-Einsatz beträgt ' + _min);
            return;
        }

        if (amount > _max) {
            $('#NOTICE').html('Der Höchst-Einsatz beträgt ' + _max);
            return;
        }

        Client.sendEvent('Nutshell', {'selected': id, 'amount': amount});
    }

}

