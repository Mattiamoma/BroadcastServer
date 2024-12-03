const state = require("./state");
const readline = require("readline");
const encryption = require("./encryption");
const commands = require("../commands/commands");
const { symmetricKey, iv } = state.getSymmetricKeyAndIv();

const startCLI = (ws) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ">"
    });
    rl.prompt();

    if (!ws) {
        console.error("WebSocket is not initialized.");
        process.exit(1);
    }


    rl.on("line", (input) => {
        //encrypt the message using the symmetric key and iv and send it to the server
        if(input.startsWith("/")) {
            commands.handleCommand(input, ws, rl);
            return;
        }
        
        const encryptedMessage = encryption.symmetricEncrypt(symmetricKey, input, iv);
        let message = {
            header: "message",
            channel: state.getCurrentChannel(),
            body: encryptedMessage
        };
        ws.send(JSON.stringify(message));
        rl.prompt();


    });
    

    rl.on("close", () => {
        process.exit(0);
    });

    return rl;
}


module.exports = {
    startCLI
}