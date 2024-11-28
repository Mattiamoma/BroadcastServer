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
                //if the client does not have a valid key setted in the connectedUsers map then this should be a message with key and iv to set the encryption logic
                message = JSON.parse(message);
                if(message.header !== "encryption") {
                    console.log("Invalid message");
                    ws.close();
                    return;
                }
                StoreKeyAndIv(ws, message, privateKey);
                return;
            }

            message = JSON.parse(message);

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



const StoreKeyAndIv = (ws, message, privateKey) => {

    //decrypt the message with the private key for the symmetric encryption
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

}


const forwardMessage = (wss, ws, message) => {
    wss.clients.forEach((client) => {
        
        if (client !== ws && connectedUsers.get(client) && client.readyState === WebSocket.OPEN) {
            //if the client is not the sender and the client has a valid key setted in the connectedUsers map
            //then send message with encrypted body
            //make a copy of the message object to avoid modifying the original message
            let messageToSend = {...message};
            messageToSend.body = encryption.symmetricEncrypt(connectedUsers.get(client).key, String(message.body), connectedUsers.get(client).iv);
            client.send(JSON.stringify(messageToSend));
        }
    });
}

startServer();
