const encryption = require('./encryption.js');
const WebSocket = require('ws');
var commandsTimeout = undefined;
var currentChannel = "GLOBAL";
const { symmetricKey, iv } = encryption.generateSymKeyAndIv();
const connectedUsers = new Map();

const {publicKey, privateKey} = encryption.generateKeyPair(); 

const getPublicAsymKey = () => {   
    return publicKey;
}

const getPrivateAsymKey = () => {
    return privateKey;
}


const getSymmetricKeyAndIv = () => {
    return { symmetricKey, iv };
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
    getSymmetricKeyAndIv,
    getPublicAsymKey,
    getPrivateAsymKey,
    connectedUsers
}
