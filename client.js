const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:8080");
const readline = require("readline");
const encryption = require("./encryption");
var publicKey = undefined;
const { symmetricKey, iv } = encryption.generateSymKeyAndIv();
var rl = undefined;



const startClient = () => {

    ws.on("open", () => {
        console.log("Connected to server");
    });

    ws.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        if(parsedMessage.header === "connect") {
            console.log("Received public key from server");
            
            establishEncryption(ws, parsedMessage);

            rl = startCLI();
            
            return;
        }

        if(rl) {
            let line = rl.line;

            // clear line
            rl.write(null, {ctrl: true, name: "u"}); 
            const decryptedMessage = encryption.symmetricDecrypt(symmetricKey, parsedMessage.body, iv);
            console.log("Received message =>", decryptedMessage);
    
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



const establishEncryption = (ws, parsedMessage) => {
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
        const encryptedMessage = encryption.symmetricEncrypt(symmetricKey, input, iv);
        let message = {
            header: "",
            body: encryptedMessage
        }

        ws.send(JSON.stringify(message));
        rl.prompt();
    });

    rl.on("close", () => {
        process.exit(0);
    });

    return rl;
}

startClient();