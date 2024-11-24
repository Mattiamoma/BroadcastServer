const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:8080");
const readline = require("readline");


const startClient = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ">"
    });


    ws.on("open", () => {
        console.log("Connected to server");
        rl.prompt();
    });

    ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        let line = rl.line;
        rl.write(null, {ctrl: true, name: "u"}); // clear line
        console.log("Received message =>", parsedMessage.toString());

        //restore the line that was being typed before the message was received 
        rl.prompt(); 
        rl.write(line);
        
        
    });

    ws.on("close", () => {
        console.log("Disconnected from server");
        process.exit(0);
    });


    rl.on("line", (input) => {
        let message = {
            header: "",
            body: input
        }
        ws.send(JSON.stringify(message));
        rl.prompt();
    });

    rl.on("close", () => {
        ws.close();
        process.exit(0);
    });
}


startClient();