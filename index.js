const readline = require("readline");

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

    if(input[0] === "bs") {
        //entered command to start server or client
        
        if(input[1] === "start" && input[2] === "-p" && input[3]) {
            //start server
            let port = input[3];
            const server = require("./server.js");
            rl.close();
            server.startServer(port);
            
        } 
        else if(input[1] === "connect" && input[2] == "-u" && input[3]) {
            //start client
            const client = require("./client.js");
            let username = input[3] + "#" + Math.floor(1000 + Math.random() * 9000);     
            rl.close();
            console.log(`Connecting as ${username}`);
            client.startClient(username);
        } 
        else {
            console.log("Invalid command");
            rl.prompt();
        }
    }

    
});