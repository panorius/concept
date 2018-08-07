//Envoi des messages
exports.initChat = function (io, socket) {
    socket.on('chat-message', function (message) {
        io.emit('chat-message', message);//envoi des messages à tous le monde
    });
};