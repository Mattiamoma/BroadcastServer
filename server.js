const WebSocket = require("ws");

const startServer = () => {
    const wss = new WebSocket.Server({ port: 8080 });
    const connectedUsers = new Map(); // store connected users and their relevant information

    wss.on("connection", (ws, req) => {

        console.log("Client connected");
        connectedUsers.set(ws, req.socket.remoteAddress);
    
        ws.on("error", (error) => {
            console.log(`Error: ${error}`);
        });


        ws.on("message", (message) => {
            //TODO: implement encryption and decryption of messages
            let parsedMessage = JSON.parse(message);
            console.log(`Received message => ${(parsedMessage.body)}`); 
            forwardMessage(wss, ws, message);
        });

        ws.on("close", () => {
            connectedUsers.delete(ws);
            console.log("Client disconnected");
        });
    });

    
}


const forwardMessage = (wss, ws,  message) => {
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

startServer();
