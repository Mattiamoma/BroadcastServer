const state = require('../utils/state');
const encryption = require('../utils/encryption');
const commands = {};

const registerCommand = (name, handler) => {
    commands[name] = handler;
};


//select the command to execute based on the input
const handleCommand = (input, ws, rl) => {
    const [command, ...args] = input.split(" ");
    if (commands[command]) {
        commands[command](args, ws, rl);
    } else {
        console.log("Unknown command");
        rl.prompt();
    }
};


//get channel list from the server
registerCommand("/channels", (args, ws, rl) => {
    sendCommandMessage(ws, "channels");
    rl.pause();
    state.setCommandsTimeout(rl);
});


//switch the channel of the client
registerCommand("/join", (args, ws, rl) => {
    let switchingChannel = args[0] || "GLOBAL";
    if (switchingChannel === state.getCurrentChannel()) {
        console.log(`Already in channel: ${state.getCurrentChannel()}`);
        return;
    }
    sendCommandMessage(ws, "switch", switchingChannel);
    rl.pause();
    state.setCommandsTimeout(rl);
});



//leave the current channel and get back to the global channel
registerCommand("/leave", (args, ws, rl) => {
    if (state.getCurrentChannel() === "GLOBAL") {
        console.log("Cannot leave GLOBAL channel");
        rl.prompt();
        return;
    }
    sendCommandMessage(ws, "switch", "GLOBAL");
    state.setCommandsTimeout(rl);
    rl.pause();
});


//send a whisper message to a user
registerCommand("/whisper", (args, ws, rl) => {
    const [target, ...message] = args;
    if (!target || !message) {
        console.log("Usage: /whisper <target> <message>");
        rl.prompt();
        return;
    }
    let messageString = message.join(" ");
    sendCommandMessage(ws, "whisper", {
        target,
        message: encryption.symmetricEncrypt(state.getSymmetricKeyAndIv().symmetricKey, messageString, state.getSymmetricKeyAndIv().iv)
    });
    
    rl.prompt();
});




registerCommand("/quit", (args, ws, rl) => {
    rl.close();
});


registerCommand("/help", (args, ws, rl) => {
    console.log("Available commands:");
    console.log("/channels - list available channels");
    console.log("/join <channel> - join a channel");
    console.log("/leave - leave the current channel");
    console.log("/whisper <target> <message> - send a private message to a user");
    console.log("/quit - quit the application");
    console.log("/help - display this message");
    rl.prompt();
});




const sendCommandMessage = (ws, header, body) => {
    ws.send(JSON.stringify({
        header,
        body
    }));
}

module.exports = {
    handleCommand
};