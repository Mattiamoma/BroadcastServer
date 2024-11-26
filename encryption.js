const crypto = require('crypto');
const passphrase = 'my secret passphrase'; 


//asymmetric encryption



//generate a key pair for asymmetric encryption using rsa algorithm

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

// asymmetric encryption and decryption functions will be used to send key and iv for symmetric encryption

const asymmetricEncrypt = (publicKey, message) => {
    return crypto.publicEncrypt(
        publicKey, 
        Buffer.from(message, 'utf8')).toString('base64');
}


const asymmetricDecrypt = (privateKey, encryptedMessage) => {
    //decryption is protected also by a passphrase so needs to be specified
    return crypto.privateDecrypt({
        key: privateKey,
        passphrase
      }, Buffer.from(encryptedMessage, 'base64')).toString('utf8');
}



//symmetric encryption



//generate a random key and iv for symmetric encryption, need to be shared with the other party

const generateSymKeyAndIv = () => { 
    const symmetricKey = crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(16).toString('hex');
    return { symmetricKey, iv };
}


const symmetricEncrypt = (key, message, iv) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
    return encrypted;
}


const symmetricDecrypt = (key, encryptedMessage, iv) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
}



module.exports = {
    generateKeyPair,
    asymmetricEncrypt,
    asymmetricDecrypt,
    generateSymKeyAndIv,
    symmetricEncrypt,
    symmetricDecrypt
};