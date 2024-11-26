const WebSocket = require("ws");
const encryption = require("./encryption");
const connectedUsers = new Map(); // store connected users and their relevant information

const startServer = () => {
    const wss = new WebSocket.Server({ port: 8080 });
    
    const {publicKey, privateKey} = encryption.generateKeyPair(); 

    wss.on("connection", (ws, req) => {
        
        ws.send(JSON.stringify({ 
            header: "connect", 
            body: publicKey 
        }));

        ws.on("error", (error) => {
            console.log(`Error: ${error}`);
        });


        ws.on("message", (message) => {

            
            if(!connectedUsers.get(ws)) {
                message = JSON.parse(message);
                if(message.header !== "encryption") {
                    console.log("Invalid message");
                    return;
                }
                let decryptedMessage = JSON.parse(encryption.asymmetricDecrypt(privateKey, message.body));
                let key = decryptedMessage.key;
                let iv = decryptedMessage.iv;
                //check if key and iv are valid else close the connection
                if(!key || !iv) {
                    console.log("Invalid key or iv");
                    ws.close();
                    return;
                }
                //store the key, iv and public key of the client
                connectedUsers.set(ws, { key, iv });
                console.log("Encryption established");
                return;
            }

            message = JSON.parse(message);
            //TODO: implement encryption and decryption of messages
            let decryptedBody = encryption.symmetricDecrypt(connectedUsers.get(ws).key, message.body, connectedUsers.get(ws).iv);
            console.log(`Received message => ${(decryptedBody)}`); 
            message.body = decryptedBody;
            forwardMessage(wss, ws, message);
        });

        ws.on("close", () => {
            connectedUsers.delete(ws);
            console.log("Client disconnected");
        });
    });

    
}


const forwardMessage = (wss, ws, message) => {
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            message.body = encryption.symmetricEncrypt(connectedUsers.get(client).key, String(message.body), connectedUsers.get(client).iv);
            client.send(JSON.stringify(message));
        }
    });
}

startServer();
