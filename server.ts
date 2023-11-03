import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import 'dotenv/config';
import {IncomingMessage, Server, createServer} from 'http';
import ws, { WebSocketServer } from 'ws';
import { router as channelsRouter } from './channels/router.js';
import { broadcast } from './util/message.util.js';
import { generateUniqueID, parseQueryString } from './util/connection.util.js';


const app: express.Application = express();

console.log(process.env.DB_HOST);
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

db.connect((err) => {
    if(err){
        console.log(err);
        return;
    }
});

app.use(cors());

// channels map channel names to a set of user names within that channel
const channels : Map<string, Set<string>> = new Map<string, Set<string>>();

// store the web socket connections associated with a given user name
const users : Map<string, Set<webSocket>> = new Map<string, Set<webSocket>>();


app.use("/channels", channelsRouter);

const httpServer: Server = createServer(app);

const wsServer: ws.WebSocketServer = new WebSocketServer({
    server: httpServer,
    clientTracking: true
});

interface webSocket extends ws.WebSocket{
    connectionId?: string
}

wsServer.on('connection', (ws: webSocket, req: IncomingMessage) => {
    ws.connectionId = generateUniqueID();
    const parsedQuery = parseQueryString(req.url || "");

    if(!parsedQuery["username"]){
        console.log("No username associated with connection. Aborting.");
        ws.close();
    }

    const username: string = parsedQuery["username"];
    if(!users.has(username)){
        users.set(username, new Set<webSocket>());
    }

    users.get(username)?.add(ws);

    ws.on('message', (data: ws.RawData, isBinary: boolean) => {
        try{
            const message = data.toString('utf-8');
            const jsonMessage = JSON.parse(message);
            broadcast(jsonMessage, users, channels);
        } catch(e: any){
            console.log(e);
            ws.send("Failed to send");
        }
    });

    ws.on('close', (code: number, reason: Buffer) => {
        if(username){
            const sockets : Set<webSocket> | undefined = users.get(username);
            sockets?.forEach((socket) : void => {
                if(ws.connectionId === socket.connectionId){
                    sockets.delete(socket);
                }
            });
            console.log(username + "'s remaining sockets: " + users.get(username)?.size);
        }
    });
});

export {
    httpServer,
    db,
    channels,
    users,
    wsServer,
    webSocket
}