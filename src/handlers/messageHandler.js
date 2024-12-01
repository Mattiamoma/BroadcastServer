const cli = require("../utils/cli");
const encryption = require("../utils/encryption");
const state = require("../utils/state");
const { symmetricKey, iv } = state.getSymmetricKeyAndIv();
var rl = undefined;



const clientMessageHandler = (ws, parsedMessage, username) => {

    switch(parsedMessage.header) {

        case "connect":
            //start encryption process
            console.log("Received public key from server");
        
            establishEncryption(ws, parsedMessage, username);

            rl = cli.startCLI();
            rl.setPrompt(`[${state.getCurrentChannel()}] > `);
            rl.prompt();

        return;

        case "switch":
            //switch to the channel specified in the body if timeout isn't expired yet
            if(parsedMessage.body && state.getCommandsTimeout()) {
                state.setCurrentChannel(parsedMessage.body);
                
                rl.setPrompt(`[${state.getCurrentChannel()}] > `);
                console.log(`Switched to channel: ${state.getCurrentChannel()}`);
                state.clearCommandsTimeout();
            } 
            else {
                console.log(`Error switching channel`);
                state.clearCommandsTimeout();
            }
            rl.prompt();
            break;


        
        case "channels":
            //display the available channels to the user
            if(state.getCommandsTimeout()) {
                console.log("Available channels:");
                console.log(parsedMessage.body);
                state.clearCommandsTimeout();
            } else {
                console.log("Error getting channels");
            }
            rl.prompt();
            break;
        


        case "error":
            //display the error message to the user
            console.log(`Oops, seems like an error occured: ${parsedMessage.body}`);
            rl.prompt();
            break;



        default:
            //decrypt the message with the symmetric key and iv and display it to the user 
            let line = rl.line;

            // clear line
            rl.write(null, {ctrl: true, name: "u"}); 
            const decryptedMessage = encryption.symmetricDecrypt(symmetricKey, parsedMessage.body, iv);
            console.log(`[${parsedMessage.username}]:`, decryptedMessage);
    
            //restore the line that was being typed before the message was received 
            rl.prompt(); 
            rl.write(line);
    }
    
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






module.exports = {
    clientMessageHandler,
};