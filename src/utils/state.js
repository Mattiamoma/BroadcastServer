const encryption = require('./encryption.js');
const WebSocket = require('ws');
var commandsTimeout = undefined;
var currentChannel = "GLOBAL";
const { symmetricKey, iv } = encryption.generateSymKeyAndIv();
const ws = new WebSocket("ws://localhost:8080");

const getSymmetricKeyAndIv = () => {
    return { symmetricKey, iv };
}

const getWebSocket = () => {
    return ws;
}

const setCurrentChannel = (channel) => {
    currentChannel = channel;
}

const getCurrentChannel = () => {
    return currentChannel;
}

const setCommandsTimeout = (rl) => {
    commandsTimeout = setTimeout(() => {
        console.log("Request expired");
        rl.prompt();
    }, 5000);
}


const clearCommandsTimeout = () => {   
    clearTimeout(commandsTimeout);
}

const getCommandsTimeout = () => {
    return commandsTimeout;
}   



module.exports = {
    setCurrentChannel,
    getCurrentChannel,
    setCommandsTimeout,
    clearCommandsTimeout,
    getCommandsTimeout,
    getWebSocket,
    getSymmetricKeyAndIv
}
