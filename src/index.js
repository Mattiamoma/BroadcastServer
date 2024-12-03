const readline = require("readline");
const WebSocket = require("ws");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ">"
});


rl.prompt();

rl.on("line", (input) => {
    //choose if you want to start client or server and set username

    input = input.split(" ");

    if(input[0].startsWith("-h")) {
        console.log("bs start -p <port> - Start the server on the specified port");
        console.log("bs connect -u <username> - Connect to the server as a client");
        rl.prompt();
    }


    //check if the input is valid for the bs command

    if (input[0] === "bs") {
        const command = input[1];
        const options = input.slice(2);

        switch (command) {
            case "start":
                if (options[0] === "-p" && options[1]) {
                    // Start server
                    const port = options[1];
                    const server = require("./server.js");
                    rl.close();
                    server.startServer(port);
                } else {
                    console.log("Usage: bs start -p <port>");
                    rl.prompt();
                }
                break;

            case "connect":
                if (options[0] === "-u" && options[1]) {
                    // Start client
                    const port = options[2] == "-p" ? options[3] : "8080";
                    const client = require("./client.js");
                    const username = options[1] + "#" + Math.floor(1000 + Math.random() * 9000);
                    rl.close();
                    console.log(`Connecting as ${username}`);
                    const ws = new WebSocket("ws://localhost:" + port);
                    client.startClient(username, ws);
                } else {
                    console.log("Usage: bs connect -u <username> -p <port>");
                    rl.prompt();
                }
                break;

            default:
                console.log("Invalid command");
                rl.prompt();
                break;
        }
    }

    
});
