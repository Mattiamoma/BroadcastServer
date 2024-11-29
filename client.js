const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:8080");
const readline = require("readline");
const encryption = require("./encryption");
const { cp } = require("fs");
var publicKey = undefined;
const { symmetricKey, iv } = encryption.generateSymKeyAndIv();
var rl = undefined;
var commandsTimeout = undefined;
var currentChannel = "GLOBAL";



const startClient = (username) => {

    ws.on("open", () => {
        console.log("Connected to server");
    });

    ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);

        switch(parsedMessage.header) {

            case "connect":
                console.log("Received public key from server");
            
                establishEncryption(ws, parsedMessage, username);

                rl = startCLI();
                rl.setPrompt(`[${currentChannel}] > `);
                rl.prompt();

            return;

            case "switch":
                
                if(parsedMessage.body && commandsTimeout) {
                    currentChannel = parsedMessage.body;
                    
                    rl.setPrompt(`[${currentChannel}] > `);
                    console.log(`Switched to channel: ${currentChannel}`);
                    clearTimeout(commandsTimeout);
                } 
                else {
                    console.log(`Error switching channel`);
                    clearTimeout(commandsTimeout);
                }
                rl.prompt();
                break;


            
            case "channels":
                if(commandsTimeout) {
                    console.log("Available channels:");
                    console.log(parsedMessage.body);
                    clearTimeout(commandsTimeout);
                } else {
                    console.log("Error getting channels");
                }
                rl.prompt();
                break;
            


            case "error":
                console.log(`Oops, seems like an error occured: ${parsedMessage.body}`);
                rl.prompt();
                break;



            default:
                let line = rl.line;

                // clear line
                rl.write(null, {ctrl: true, name: "u"}); 
                const decryptedMessage = encryption.symmetricDecrypt(symmetricKey, parsedMessage.body, iv);
                console.log(`[${parsedMessage.username}]:`, decryptedMessage);
        
                //restore the line that was being typed before the message was received 
                rl.prompt(); 
                rl.write(line);
        }
                
        
        
    });

    ws.on("close", () => {
        console.log("Disconnected from server");
        process.exit(0);
    });


}







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






const startCLI = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ">"
    });
    rl.prompt();



    rl.on("line", (input) => {
        //encrypt the message using the symmetric key and iv and send it to the server

        const [command, ...args] = input.split(" ");

        switch (command) {

            case "/channels":
                ws.send(JSON.stringify({
                    header: "channels"
                }));
                rl.pause();
                commandsTimeout = setTimeout(() => {
                    console.log("Timeout getting channels");
                    rl.prompt();
                }, 5000);
                break;

            case "/join":

                let switchingChannel = args[0] || "GLOBAL";
                if(switchingChannel === currentChannel) {
                    console.log(`Already in channel: ${currentChannel}`);
                    break;
                }
                console.log(`Switching to channel: ${switchingChannel}`);
                ws.send(JSON.stringify({
                    header: "switch",
                    body: switchingChannel
                }));
                rl.pause();

                commandsTimeout = setTimeout(() => {
                    console.log("Timeout switching channel");
                    rl.prompt();
                }, 5000);

                break;

            case "/leave":
                if(currentChannel === "GLOBAL") {
                    console.log("Cannot leave GLOBAL channel");
                    break;
                }
                ws.send(JSON.stringify({
                    header: "switch",
                    channel: "GLOBAL"
                }));
                rl.pause();

                commandsTimeout = setTimeout(() => {
                    console.log("Timeout switching channel");
                    rl.prompt();
                }, 5000);
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
                break;

            
            default:

                if(input.startsWith("/")) {
                    console.log("Invalid command");
                    rl.prompt();
                    break;
                }

                const encryptedMessage = encryption.symmetricEncrypt(symmetricKey, input, iv);
                let message = {
                    header: "message",
                    channel: currentChannel,
                    body: encryptedMessage
                };
                ws.send(JSON.stringify(message));
                rl.prompt();
                break;
        }


    });


    

    rl.on("close", () => {
        process.exit(0);
    });

    return rl;
}

startClient(Math.random().toString(36).substring(7));



module.exports = {
    startClient
}