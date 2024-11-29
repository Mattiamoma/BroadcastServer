const WebSocket = require("ws");
const encryption = require("./encryption");
const connectedUsers = new Map(); // store connected users and their relevant information

const availableChannels = ["GLOBAL", "CHANNEL1", "CHANNEL2", "CHANNEL3"];
const defaultChannel = "GLOBAL";

const startServer = (port) => {
    const wss = new WebSocket.Server({ port: port });

    console.log(`Server started on port ${port}`);
    
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

            message = JSON.parse(message);

            if(!connectedUsers.has(ws) && message.header !== "encryption") {
                console.log("Invalid message");
                ws.close();
                return;
            }

               
            
            
            switch(message.header) {

                case "encryption":
                    if(message.header !== "encryption") {
                        console.log("Invalid message");
                        ws.close();
                        break;
                    }
                    StoreKeyAndIv(ws, message, privateKey);
                    break;

                case "switch":
                    if(availableChannels.includes(message.body)) {
                        connectedUsers.get(ws).channel = message.body;
                        console.log(`Switched to channel: ${message.body}`);
                        ws.send(JSON.stringify({
                            header: "switch",
                            body: message.body
                        }));
                    } else {
                        console.log(`Channel ${message.body} does not exist`);
                        ws.send(JSON.stringify({ 
                            header: "switch", 
                            body: false
                        }));
                    }
                    return;


                case "channels":
                    ws.send(JSON.stringify({ 
                        header: "channels", 
                        body: availableChannels 
                    }));
                    return;


                default:
                    let decryptedBody;
                    try {
                        decryptedBody = encryption.symmetricDecrypt(connectedUsers.get(ws).key, message.body, connectedUsers.get(ws).iv);
                    } catch (error) {
                        console.log(`Decryption error: ${error}`);
                        ws.send(JSON.stringify({ 
                            header: "error", 
                            body: "Error decrypting message"
                        }));
                        return;
                    }
                    
                    message.body = decryptedBody;
                    forwardMessage(wss, ws, message);
            }

            
        });

        ws.on("close", () => {
            connectedUsers.delete(ws);
            console.log("Client disconnected");
        });
    });

    
}



const StoreKeyAndIv = (ws, message, privateKey) => {

    //decrypt the message with the private key for the symmetric encryption
    let decryptedMessage;
    try {
        decryptedMessage = JSON.parse(encryption.asymmetricDecrypt(privateKey, message.body));
    } catch (error) {
        console.log(`Decryption error: ${error}`);
        ws.close();
        return;
    }
    let key = decryptedMessage.key;
    let iv = decryptedMessage.iv;

    //check if key and iv are valid else close the connection
    if(!key || !iv) {
        console.log("Invalid key or iv");
        ws.close();
        return;
    }
    let username = message.username;
    //store the key, iv and public key of the client
    connectedUsers.set(ws, { key, iv, username, channel: defaultChannel });
    console.log(`Client connected as ${username}`);

}


const forwardMessage = (wss, ws, message) => {
    let sender = connectedUsers.get(ws);
    
    message.username = sender.username;
    wss.clients.forEach((client) => {
        let receiver = connectedUsers.get(client);
        
        if (client !== ws && receiver && receiver.channel == sender.channel && client.readyState === WebSocket.OPEN) {
            console.log(`Sending message to ${receiver.username}`);
            //if the client is not the sender and the client has a valid key setted in the connectedUsers map
            //then send message with encrypted body
            //make a copy of the message object to avoid modifying the original message
            let messageToSend = {...message};
            messageToSend.body = encryption.symmetricEncrypt(receiver.key, String(message.body), receiver.iv);
            client.send(JSON.stringify(messageToSend));
        }
    });
}

startServer(8080);

module.exports = {
    startServer
}
