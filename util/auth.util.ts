import crypto from 'crypto';

interface HashedPassword {
    hash: string,
    salt: string
}

function generateSalt(size: number) : string {
    return crypto.randomBytes(size).toString('hex');
}

function hashPassword(password: string, salt: string = "") : HashedPassword {
    const hash: crypto.Hash = crypto.createHash('sha256');
    hash.update(process.env.GLOBAL_SALT || "");
    salt = salt ? salt : generateSalt(6);
    hash.update(salt);
    hash.update(password);
    
    return {hash: hash.digest('hex'), salt: salt};
}


export {
    hashPassword,
    HashedPassword
}