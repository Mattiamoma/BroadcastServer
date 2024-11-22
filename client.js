const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:8080");
const readline = require("readline");


const startClient = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


    ws.on("open", () => {
        console.log("Connected to server");
        ws.send("Hello from client");
    });

    ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        console.log("Received message =>", parsedMessage);
        
    });

    ws.on("close", () => {
        console.log("Disconnected from server");
    });


    rl.on("line", (input) => {
        ws.send(input);
    });
}


startClient();