const getCurrentChannel = require("../utils/state.js").getCurrentChannel;
const state = require("../utils/state.js");
const commands = ["channels", "join", "leave", "quit", "help"];

const isCommand = (input) => {
    let command = input.split(" ")[0];
    if(command.startsWith("/")) {
        command = command.slice(1);
        return commands.includes(command);
    }
    
    return false; 
}

const handleCommands = (command, args, rl, ws) => {

    if(!isCommand(command)) {
        console.log("Invalid command");
        rl.prompt();
        return;
    }


    switch (command.toLowerCase()) {

        case "/channels":
            sendCommandMessage(ws, "channels");
            rl.pause();
            timeout = state.setCommandsTimeout(rl);
            break;

        case "/join":

            let switchingChannel = args[0] || "GLOBAL";
            if(switchingChannel === getCurrentChannel()) {
                console.log(`Already in channel: ${getCurrentChannel()}`);
                break;
            }
            sendCommandMessage(ws, "switch", switchingChannel);
            rl.pause();
            state.setCommandsTimeout(rl);

            break;

        case "/leave":
            if(getCurrentChannel() === "GLOBAL") {
                console.log("Cannot leave GLOBAL channel");
                rl.prompt();
                break;
            }
            sendCommandMessage(ws, "switch", "GLOBAL");
            state.setCommandsTimeout(rl);
            rl.pause();

            
            break;


        case "/quit":
            rl.close();
            break;

        case "/help":
            console.log("Available commands:");
            console.log("/channels - List available channels");
            console.log("/join <channel> - Join a channel");
            console.log("/leave - Leave the current channel");
            console.log("/quit - Quit the chat");
            rl.prompt();
            break;

        default:
            console.log("Invalid command");
            rl.prompt();
    }
}

const sendCommandMessage = (ws, header, body) => {
    ws.send(JSON.stringify({
        header,
        body
    }));
}



module.exports = { 
    handleCommands,
    isCommand
}