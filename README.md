# WebSocket Broadcast Server
![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green)
![WebSocket](https://img.shields.io/badge/WebSocket-API-blue)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A simple WebSocket-based broadcast server that receives encrypted messages from clients and broadcasts them to all other connected clients. It uses both asymmetric and symmetric encryption to ensure secure communication between the server and clients.

## Features

- **Broadcast Messaging**: Messages received from one client are sent to all other connected clients.

- **Encryption**: 

  - **Asymmetric Encryption** is used for securely sharing the symmetric key and initialization vector (IV) between the server and each client.

  - **Symmetric Encryption** is used for encrypting messages during communication.

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

### Start the Server

In your terminal run

```bash
node server.js
```

The server will start listening for connections on ```ws://localhost:8080```

### Start a Client

```bash
node client.js
```

Each client connects to the server and securely establishes encryption. The client can send messages interactively.



### Sending Messages

- Type a message and press ```Enter``` to send it to the server.
- Other connected clients will receive the broadcasted message.

---

## Folder Structure

```bash
.
├── server.js           # Server-side implementation
├── client.js           # Client-side implementation
├── encryption.js       # Encryption utility 
├── README.md           # Project documentation
└── package.json        # Node.js project configuration

```

