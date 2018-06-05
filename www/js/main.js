function getUI(key, content) {
    Client.sendEvent(key, {'content': content});
}