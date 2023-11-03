import crypto from 'crypto';


function generateSalt(size: number) : string {
    return crypto.randomBytes(size).toString('utf-8');
}

function hashPassword(password: string, salt: string = "") : string {
    const hash: crypto.Hash = crypto.createHash('sha256');
    hash.update(process.env.GLOBAL_SALT || "");
    hash.update(salt ? salt : generateSalt(12));
    hash.update(password);
    
    return hash.digest('hex');
}


export {
    hashPassword
}