const state = require('../utils/state');

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
    }
};



registerCommand("/channels", (args, ws, rl) => {
    sendCommandMessage(ws, "channels");
    rl.pause();
    state.setCommandsTimeout(rl);
});



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




registerCommand("/quit", (args, ws, rl) => {
    rl.close();
});


registerCommand("/help", (args, ws, rl) => {
    console.log("Available commands:");
    console.log("/channels - list available channels");
    console.log("/join <channel> - join a channel");
    console.log("/leave - leave the current channel");
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