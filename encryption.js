const crypto = require('crypto');
const passphrase = 'my secret passphrase'; 
//asymmetric encryption

const generateKeyPair = () => {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: passphrase
        }
    });
}


const asymmetricEncrypt = (publicKey, message) => {
    return crypto.publicEncrypt(publicKey, Buffer.from(text, 'utf8')).toString('base64');
}


const asymmetricDecrypt = (privateKey, encryptedMessage) => {
    return crypto.privateDecrypt({
        key: privateKey,
        passphrase
      }, Buffer.from(encryptedMessage, 'base64')).toString('utf8');
}



//symmetric encryption


