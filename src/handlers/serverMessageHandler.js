const headers = {}
const encryption = require("../utils/encryption");
const WebSocket = require("ws");
const state = require("../utils/state");
const availableChannels = ["GLOBAL", "CHANNEL1", "CHANNEL2", "CHANNEL3"];
const defaultChannel = "GLOBAL";

//register a header with a handler
const registerHeader = (name, handler) => {
    headers[name] = handler;
}


//handle the message based on the header
const handleServerMessage = (ws, message, wss) => {
    if(!state.connectedUsers.has(ws) && message.header !== "encryption") {
        //if the client is not connected and the header is not encryption then close the connection
        console.log("Client not connected");
        ws.send(JSON.stringify({
            header: "error",
            body: "Client not connected"
        }));
        ws.close();
        return;
    }


    if (headers[message.header]) {
        headers[message.header](ws, message, wss);
    } else {
        console.log("Unknown header");
    }
}


//store the key and iv of the client for symmetric encryption
registerHeader("encryption", (ws, message) => {
    StoreKeyAndIv(ws, message, state.getPrivateAsymKey());
});



//switch the channel of the client
registerHeader("switch", (ws, message) => {
    let channelName = message.body.toUpperCase();

    //check if the channel exists in the availableChannels array
    if (availableChannels.includes(channelName)) {
        state.connectedUsers.get(ws).channel = channelName;
        console.log(`Switched to channel: ${channelName}`);

        //send the channel name to the client to confirm the switch
        ws.send(JSON.stringify({
            header: "switch",
            body: channelName
        }));
    } 
    else {
        console.log(`Channel ${channelName} does not exist`);
        ws.send(JSON.stringify({
            header: "switch",
            body: false
        }));
    }
});




//send available channels to the client
registerHeader("channels", (ws, message) => {
    ws.send(JSON.stringify({
        header: "channels",
        body: availableChannels
    }));
});




//broadcast the message to all clients in the same channel
registerHeader("message", (ws, message, wss) => {
    let decryptedBody;
    try {
        decryptedBody = encryption.symmetricDecrypt(state.connectedUsers.get(ws).key, message.body, state.connectedUsers.get(ws).iv);
    } 
    catch (error) {
        console.log(`Decryption error: ${error}`);
        ws.send(JSON.stringify({
            header: "error",
            body: "Error decrypting message"
        }));
        return;
    }

    message.body = decryptedBody;
    forwardMessage(wss, ws, message);
});




registerHeader("whisper", (ws, message, wss) => {
    let sender = state.connectedUsers.get(ws);
    //find the receiver in the connectedUsers map based on the target username
    let receiverEntry = Array.from(state.connectedUsers.entries()).find(([key, user]) => user.username === message.body.target);
    let receiver = receiverEntry ? receiverEntry[1] : null;

    //if the receiver is not found then send an error message to the sender
    if (!receiver) { 
        console.log("User not found");
        ws.send(JSON.stringify({
            header: "error",
            body: "User not found"
        }));
        return;
    }

    let decryptedBody;
    try {
        decryptedBody = encryption.symmetricDecrypt(sender.key, message.body.message, sender.iv);
    } 
    catch (error) {
        console.log(`Decryption error: ${error}`);
        ws.send(JSON.stringify({
            header: "error",
            body: "Error decrypting message"
        }));
        return;
    }

    //get the websocket of the receiver from the entry in the connectedUsers map to send the message
    let receiverWs = receiverEntry[0];
    message.body = decryptedBody;
    message.username = sender.username;

    //encrypt the message with the receiver's key and iv and send it
    message.body = encryption.symmetricEncrypt(receiver.key, String(message.body), receiver.iv);
    receiverWs.send(JSON.stringify(message));
});








const StoreKeyAndIv = (ws, message, privateKey) => {

    //decrypt the message with the private key for the symmetric encryption
    let decryptedMessage;
    try {
        decryptedMessage = JSON.parse(encryption.asymmetricDecrypt(privateKey, message.body));
    } catch (error) {
        console.log(`Decryption error: ${error}`);
        ws.send(JSON.stringify({
            header: "error",
            body: "Error retrieving symmetric key and iv"
        }));
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
    state.connectedUsers.set(ws, { key, iv, username, channel: defaultChannel });
    console.log(`Client connected as ${username}`);

}


const forwardMessage = (wss, ws, message) => {
    let sender = state.connectedUsers.get(ws);
    
    message.username = sender.username;
    wss.clients.forEach((client) => {
        let receiver = state.connectedUsers.get(client);
        
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



module.exports = {
    handleServerMessage,
}