# WebSocket Broadcast Server
![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green)
![WebSocket](https://img.shields.io/badge/WebSocket-blue)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A simple WebSocket-based broadcast server that receives encrypted messages from clients and broadcasts them to all other connected clients. It uses both asymmetric and symmetric encryption to ensure secure communication between the server and clients.

## Features

- **Broadcast Messaging**: Messages received from one client are sent to all other connected clients.

- **Private Messaging**: Clients can send direct messages to specific clients securely.

- **Encryption**: 
    - **Asymmetric Encryption** is used for securely sharing the symmetric key and initialization vector (IV) between the server and each client.
    - **Symmetric Encryption** is used for encrypting messages during communication.

- **Commands Management**: Supports various commands for enhanced client-server interaction.

- **Error Handling**: Manages unexpected client behavior and invalid messages.

- **Interactive Client Interface**: Clients can type and send messages via a CLI.

---

## How It Works

1. **Server Initialization**:  
   The server starts on port `8080` and generates an asymmetric key pair.
2. **Client Connection**:  
   When a client connects, the server shares its public key. The client generates a symmetric key and IV and sends it back encrypted with the server's public key.
3. **Message Broadcast**:  
   - Once encryption is established, clients can send messages.
   - The server decrypts incoming messages and re-encrypts them for other clients using their respective symmetric keys and IVs.
4. **Secure Communication**:  
   Messages are decrypted and displayed securely on the receiving client’s CLI.

---


## Project Structure

```bash

/BroadcastServer
├── /src
│   ├── /commands
│   │   └── commands.js
│   │
│   ├── /handlers
│   │   └── messageHandlers.js
│   │
│   ├── /utils
│   │   ├── cli.js
│   │   ├── encryption.js
│   │   └── state.js
│   │
│   ├── client.js
│   ├── server.js
│   └── config.js
│   
├── .gitignore
├── package.json
└── README.md
```


## Installation

### Prerequisites

- Node.js (v14 or above)

### Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
    ```bash
    npm install
    ```

---

## Usage

In your terminal run 
```bash
npm run dev
```
And a CLI will open



### Using the CLI

You can use the CLI to start the server or connect as a client:

- To start the server on a specified port:
    ```bash
    bs start -p <port>
    ```

- To connect to the server as a client with a specified username (port is optional, default: 8080):
    ```bash
    bs connect -u <username> -p <port>
    ```

For help with commands, type:
```bash
-h
```



### Sending Messages

- Type a message and press ```Enter``` to send it to the server.
- Other connected clients will receive the broadcasted message.


## Available Commands

The client supports several commands to enhance interaction with the server:

- **/channels**: List available channels.

- **/join <channel>**: Join a specified channel.

- **/leave**: Leave the current channel and return to the GLOBAL channel.

- **/whisper <target> <message>**: Send a private message to a specific client.

- **/quit**: Quit the application.

- **/help**: Display the list of available commands.

These commands can be executed by typing them into the client's CLI.





## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


## Inspiration

This project was inspired by the [Broadcast Server project](https://roadmap.sh/projects/broadcast-server) on roadmap.sh.
