let Install = {

    isFirstStart: function () {

        if (_Persistence.hasObject('CFG')) {
            let tmpConfig = _Persistence.getObject('CFG');
            if ('General' in tmpConfig) {
                return false;
            }
        }

        return true;

    },

    prepareInstall: function () {

        if (!this.isFirstStart()) {
            return false;
        }

        let owner = _ChOwners[0];

        _Botuser.sendPrivateMessage('Hallo ' + owner.getNick() + ', ich bin dein neuer App-Bot. :)°#°°#°' +
            'Meine erste Aufgabe ist es, dich durch die Installation unserer App, ChannelControl, zu begleiten.', owner);

        setTimeout(function () {
            _Botuser.sendPrivateMessage('_Was ist ChannelControl?_°#°' +
                'ChannelControl wurde entwickelt um dir und deinem Channelteam ' +
                'die Administration deines Channels so einfach wie möglich zu gestalten. Zu diesem Zweck bietet dir ' +
                'ChannelControl einige neue Funktionen (°>.help|/.help<°) und Möglichkeiten.°#°°#°' +
                'Es gibt auch eine Plus-Version der App. Diese beschränkt sich nicht mehr nur auf die einfache Administration ' +
                'sondern bietet dir auch einige (Glücks-)Spiele für deinen Channel.°#°°#°' +
                '°>Mehr erfahren (externer Link)|https://seiplab.de/forum/board/5-channelcontrol-3/<°°#°', owner);
        }, 2000);

        setTimeout(function () {
            _Botuser.sendPrivateMessage('_Ohne das geht es nicht_°#°' +
                '°>Datenschutzerklärung ChannelControl (externer Link)|https://seiplab.de/knuddels-datenschutz/<°°#°' +
                '°>Nutzungsbedingungen ChannelControl (externer Link)|https://seiplab.de/channelcontrol---nutzungsbedingungen/<°°#°' +
                'Mit der Installation stimmst du der Datenschutzerklärung und den Nutzungsbedingungen für ChannelControl zu.°#°°#°' +
                'Für die Nutzung von ChannelControl ist ein Account auf unserer Support-Seite notwendig, dieser wird automatisch für dich eingerichtet.°#°' +
                '°>Datenschutzerklärung seiplab.de (externer Link)|https://seiplab.de/datenschutzerklaerung/<°°#°' +
                '°>Nutzungsbedingungen seiplab.de (externer Link)|https://seiplab.de/nutzungsbedingungen/<°' +
                'Mit der Installation stimmst du der Datenschutzerklärung und den Nutzungsbedingungen für seiplab.de zu.°#°°#°' +
                '°>Ich habe diese Bedingungen und Erklärungen gelesen, verstanden und akzeptiert! Beginne die Installation|/.install<°', owner);
        }, 6000);

    },

    installApp: function (user) {

        if (!this.isFirstStart()) {
            _Botuser.sendPrivateMessage('Die Installation wurde bereits durchgeführt.', user);
            return false;
        }

        CORE.makeInstall();
        CORE.getConfig();
        this.endInstall(user);

    },

    endInstall: function (user) {

        _Botuser.sendPrivateMessage('Die Installation der App war erfolgreich.°#°' +
            'Ich werde in wenigen Sekunden einen Neustart durchführen. Anschließend werde ich voll Einsatzbereit sein.', user);

        _AppInstance.getRootInstance().updateApp('', 'Beenden der Installation');

    }

};


ChatCommands.install = function (user, cmd, params) {

    if (!user.isChannelOwner()) {
        _Botuser.sendPrivateMessage(_LNG.System.Error.NoRights, user);
        return;
    }

    Install.installApp(user);

};

App.chatCommands['.install'] = function (user, params, cmd) {
    ChatCommands.install(user, cmd, params);
};