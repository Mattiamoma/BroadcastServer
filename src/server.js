const WebSocket = require("ws");
const state = require("./utils/state");
const handleServerMessage = require("./handlers/serverMessageHandler").handleServerMessage;

const startServer = (port) => {
    const wss = new WebSocket.Server({ port: port });

    console.log(`Server started on port ${port}`);
    
    

    wss.on("connection", (ws, req) => {

        
        ws.send(JSON.stringify({ 
            header: "connect", 
            body: state.getPublicAsymKey() 
        }));

        ws.on("error", (error) => {
            console.log(`Error: ${error}`);
        });


        ws.on("message", (message) => {

            message = JSON.parse(message);

            handleServerMessage(ws, message, wss);

            
        });

        ws.on("close", () => {
            state.connectedUsers.delete(ws);
            console.log("Client disconnected");
        });
    });

    
}


//startServer(8080);

module.exports = {
    startServer
}
