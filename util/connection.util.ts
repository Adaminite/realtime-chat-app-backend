import { Buffer } from 'buffer';
import crypto from 'crypto';
import querystring from 'querystring';
import { users, channels } from '../server.js';

function generateUniqueID() : string {
    const buffer : Buffer = crypto.randomBytes(20);
    return buffer.toString('utf-8');
}

function parseQueryString(url: string) : any {
    const toParse = url.substring(2); // assume that the url starts with '/?'
    const parsedQuery = querystring.parse(toParse);
    return parsedQuery;
}

export {
    generateUniqueID,
    parseQueryString
}