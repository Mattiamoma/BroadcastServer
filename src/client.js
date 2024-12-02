const clientMessageHandler = require("./handlers/clientMessageHandler").clientMessageHandler;
const state = require("./utils/state");
const ws = state.getWebSocket();



const startClient = (username) => {

    ws.on("open", () => {
        console.log("Connected to server");
    });

    ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);

        clientMessageHandler(ws, parsedMessage, username);

    });

    ws.on("close", () => {
        console.log("Disconnected from server");
        process.exit(0);
    });


}



module.exports = {
    startClient,
}