import express, { json } from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import 'dotenv/config';
import {IncomingMessage, Server, createServer} from 'http';
import ws, { WebSocketServer } from 'ws';
import { router as channelsRouter } from './channels/router.js';
import { router as usersRouter } from './users/router.js';
import { router as messagesRouter } from './messages/router.js';
import { broadcast } from './util/message.util.js';
import { generateUniqueID, parseQueryString } from './util/connection.util.js';
import { addMessageToDatabase, getChannelsByUser, getUserByUsername } from './util/db.util.js';


const app: express.Application = express();

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


/* The following data structures are the in-memory store of data required for the WebSocket connections
   to function properly
*/

// channels map to map channel ids to channel names
const idToChannelName: Map<number, String> = new Map<number, String>();

// channels map a channel id to user ids
const channels : Map<number, Set<number>> = new Map<number, Set<number>>();

// store the web socket connections associated with a given user id
const users : Map<number, Set<webSocket>> = new Map<number, Set<webSocket>>();

// maps user ids to user names (so receivers know who sent the message)
const idToUserName: Map<number, string> = new Map<number, string>();

app.use("/channels", channelsRouter);
app.use("/users", usersRouter);
app.use("/messages", messagesRouter);

const httpServer: Server = createServer(app);

const wsServer: ws.WebSocketServer = new WebSocketServer({
    server: httpServer,
    clientTracking: true
});

interface webSocket extends ws.WebSocket{
    connectionId?: string,
    userId?: number,
    username?: string
}

wsServer.on('connection', async (ws: webSocket, req: IncomingMessage) => {
    const parsedQuery = parseQueryString(req.url || "");
    if(!parsedQuery["username"]){
        console.log("No username associated with connection. Aborting.");
        ws.close();
        return;
    }

    const username: string = parsedQuery["username"];
    let userMatch = null;
    try{
        userMatch = await getUserByUsername(db, username);

        if(userMatch.length === 0){
            throw "No username associated with connection";
        }

        userMatch = userMatch[0];
    } catch(err){
        console.log(err);
        ws.close();
        return;
    }

    ws.connectionId = generateUniqueID();
    ws.userId = userMatch.id;
    ws.username = username;

    if(!users.has(userMatch.id)){
        users.set(userMatch.id, new Set<webSocket>());
        idToUserName.set(userMatch.id, userMatch.username);

        let channelMatch = null;
        try{
            channelMatch = await getChannelsByUser(db, userMatch.id);
        } catch(err){
            console.log(err);
            ws.close();
            return;
        }
    
        for(let channel of channelMatch){
            if(!channels.has(channel.id)){
                channels.set(channel.id, new Set<number>());
            }

            if(!idToChannelName.has(channel.id)){
                idToChannelName.set(channel.id, channel.name);
            }

            channels.get(channel.id)?.add(userMatch.id);  
        }
    }


    users.get(userMatch.id)?.add(ws);


    ws.on('message', (data: ws.RawData, isBinary: boolean) => {
        try{
            const message = JSON.parse(data.toString('utf-8'));
            if(!message["event"] || message["event"] !== "broadcastMessage"){
                throw "User can only send channel messages via the WS connection";
            }
            broadcast({
                ...message,
                sender: ws.username
            }, users, channels);
            addMessageToDatabase(db, Number(ws.userId), message["channelId"], message["message"]);
        } catch(e: any){
            console.log(e);
            ws.send(JSON.stringify({
                err: "Failed to send"
            }));
        }
    });

    ws.on('close', (code: number, reason: Buffer) => {
        if(username){
            const sockets = users.get(Number(ws.userId)) || new Set<webSocket>();
            sockets?.forEach((socket) : void => {
                if(ws.connectionId === socket.connectionId){
                    sockets.delete(socket);
                }
            });
            console.log(username + "'s remaining sockets: " + users.get(Number(ws.userId))?.size);
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