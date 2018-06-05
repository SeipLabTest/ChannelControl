document.addEventListener('eventReceived', function (event) {

    let key = event.eventKey;
    let datas = event.eventData;

    if (key === 'New') {
        $('#GamePot').text(datas.Value.Total + ' Knuddel');
        $('textarea[id="GameLog"]').val('Greedy mit ' + datas.Value.Start + ' Knuddel gestartet!');
        setTimer(datas.EndTime);
        if (datas.Channelname === '/Pferderennen') {
            $('.navbar-brand').text(datas.Channelname.replace('/', ''));
        }

        let buttons = '';

        datas.BetValues.forEach(function (item, index) {
            buttons += '<li><button class="btn btn-sm btn-default" onclick="Client.sendEvent(\'Greedy\', {\'amount\':' + item + '});"><b>' + item + 'Kn F&uuml;ttern</b></button></li>';
        });

        $('#betBtn').html(buttons);

    }

    if (key === 'Update') {
        if ('LogEntry' in datas) {
            $('textarea[id="GameLog"]').val($('#GameLog').val() + '\n' + datas.LogEntry);
        }
        $('#GamePot').text(datas.Value.Total + ' Knuddel');

        if ('EndTime' in datas) {
            clearInterval(x);
            $('#GameTimer').text('00:00:00');
        }

    }

});

function setTimer(endtime) {

    // Timer
    x = setInterval(function (t) {

        var time = endtime - Date.now();
        time += 1000;
        time /= 1000;

        // Get days, hours, minutes and seconds
        var days = Math.floor(time / (24 * 60 * 60)),
            hours = Math.floor(time / (60 * 60)) % 24,
            minutes = Math.floor(time / 60) % 60,
            seconds = Math.floor(time / 1) % 60;

        // add "0" to minutes and seconds if under 10
        if (minutes < 10 && minutes >= 0) {
            minutes = '0' + minutes;
        }

        if (seconds < 10 && seconds >= 0) {
            seconds = '0' + seconds;
        }

        if (hours < 10 && hours >= 0) {
            hours = '0' + hours;
        }

        // Display Timer
        $('#GameTimer').text(hours + ':' + minutes + ':' + seconds);
        // Display End
        if (time <= 0) {
            clearInterval(x);
            $('#GameTimer').text('00:00:00');
        }
    }, 1000, this);

}