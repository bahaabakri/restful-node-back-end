let io;
const socketIoLLib = require('socket.io')
module.exports = {
    init: server => {
        io = socketIoLLib(server, { origins: '*:*'})
        return io
    },
    getIo: () => {
        if (!io) {
            throw new Error('Sorry, It seems io does not initializes')
        }
        return io
    }

}