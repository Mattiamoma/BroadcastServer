const cli = require("../utils/cli");
const encryption = require("../utils/encryption");
const state = require("../utils/state");
const { symmetricKey, iv } = state.getSymmetricKeyAndIv();
var rl = undefined;

const headers = {}


//register a header with a handler
const registerHeader = (name, handler) => {
    headers[name] = handler;
}


//handle the message based on the header
const clientMessageHandler = (ws, parsedMessage, username) => {
    if(headers[parsedMessage.header]) {
        headers[parsedMessage.header](ws, parsedMessage, username);
    } 
    else {
        console.log("Unknown header");
    }
}


//handle the connection handshake for encryption
registerHeader("connect", (ws, parsedMessage, username) => {
    console.log("Received public key from server");
    
    establishEncryption(ws, parsedMessage, username);

    rl = cli.startCLI(ws);
    rl.setPrompt(`[${state.getCurrentChannel()}] > `);
    rl.prompt();
});


//handle the switch channel response from the server
registerHeader("switch", (ws, parsedMessage) => {
    if(parsedMessage.body && state.getCommandsTimeout()) {
        state.setCurrentChannel(parsedMessage.body);
        
        rl.setPrompt(`[${state.getCurrentChannel()}] > `);
        console.log(`Switched to channel: ${state.getCurrentChannel()}`);
        state.clearCommandsTimeout();
    } 
    else {
        console.log(`Error switching channel`);
        state.clearCommandsTimeout();
    }
    rl.prompt();
});


//get the available channels from the server
registerHeader("channels", (ws, parsedMessage) => {
    if(state.getCommandsTimeout()) {
        console.log("Available channels:");
        console.log(parsedMessage.body);
        state.clearCommandsTimeout();
    } else {
        console.log("Error getting channels");
    }
    rl.prompt();
});



//handle the error message from the server
registerHeader("error", (ws, parsedMessage) => {
    console.log(`Oops, seems like an error occured: ${parsedMessage.body}`);
    rl.prompt();
});


//handle the general message broadcasted by the server
registerHeader("message", (ws, parsedMessage) => {
    let line = rl.line;

    rl.write(null, {ctrl: true, name: "u"}); 
    const decryptedMessage = encryption.symmetricDecrypt(symmetricKey, parsedMessage.body, iv);
    console.log(`[${parsedMessage.username}]:`, decryptedMessage);

    rl.prompt(); 
    rl.write(line);
});




registerHeader("whisper", (ws, parsedMessage) => {
    let line = rl.line;

    rl.write(null, {ctrl: true, name: "u"}); 
    const decryptedMessage = encryption.symmetricDecrypt(symmetricKey, parsedMessage.body, iv);

    rl.setPrompt(`\x1b[3m[whisper] > \x1b[0m`);
    rl.prompt();
    console.log(`\x1b[3m[${parsedMessage.username}]: ${decryptedMessage}\x1b[0m`);

    rl.setPrompt(`[${state.getCurrentChannel()}] > `);
    rl.prompt(); 
    rl.write(line);
});





const establishEncryption = (ws, parsedMessage, username) => {
    //parsedMessage contains the public key sent by the server in the body field
    publicKey = parsedMessage.body;
          
    //receive public key and send symmetric key and iv using asymmetric encryption
    let body = { 
        key: symmetricKey, 
        iv: iv 
    };

    //encrypt the symmetric key and iv using the public key
    const encryptedBody = encryption.asymmetricEncrypt(publicKey, JSON.stringify(body));
    let message = {
        header: "encryption",
        username: username,
        body: encryptedBody
    }

    ws.send(JSON.stringify(message));
}






module.exports = {
    clientMessageHandler,
};