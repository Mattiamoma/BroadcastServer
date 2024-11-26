const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:8080");
const readline = require("readline");
const encryption = require("./encryption");
var publicKey = undefined;
const { symmetricKey, iv } = encryption.generateSymKeyAndIv();




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
        if(parsedMessage.header === "connect") {
            
            publicKey = parsedMessage.body;
            console.log("Received public key from server");
            
            //receive public key and send symmetric key and iv using asymmetric encryption
            let body = { 
                key: symmetricKey, 
                iv: iv 
            };
            const encryptedBody = encryption.asymmetricEncrypt(publicKey, JSON.stringify(body));
            let message = {
                header: "encryption",
                body: encryptedBody
            }

            ws.send(JSON.stringify(message));
            
            rl.prompt();
            return;
            
        }
        let line = rl.line;
        rl.write(null, {ctrl: true, name: "u"}); // clear line
        const decryptedMessage = encryption.symmetricDecrypt(symmetricKey, parsedMessage.body, iv);
        console.log("Received message =>", decryptedMessage);

        //restore the line that was being typed before the message was received 
        rl.prompt(); 
        rl.write(line);
        
        
    });

    ws.on("close", () => {
        console.log("Disconnected from server");
        process.exit(0);
    });


    rl.on("line", (input) => {
        
        const encryptedMessage = encryption.symmetricEncrypt(symmetricKey, input, iv);
        let message = {
            header: "",
            body: encryptedMessage
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