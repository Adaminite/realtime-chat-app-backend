import express from 'express';
import cors from 'cors';
import {IncomingMessage, Server, createServer} from 'http';
import ws, { WebSocketServer } from 'ws';
import { router as channelsRouter } from './channels/router.js';
import { broadcast } from './util/message.util.js';

const app: express.Application = express();

app.use(cors());

const channels : Map<string, Set<ws.WebSocket>> = new Map<string, Set<ws.WebSocket>>();

app.use("/channels", channelsRouter);

const httpServer: Server = createServer(app);

const wsServer: ws.WebSocketServer = new WebSocketServer({
    server: httpServer,
    clientTracking: true
});

wsServer.on('connection', (ws: ws.WebSocket, req: IncomingMessage) => {
    
    ws.on('message', (data: ws.RawData, isBinary: boolean) => {
        try{
            const message = data.toString('utf-8');
            console.log(message)
            //wsServer.emit('message', message);
            broadcast(message, wsServer);
        } catch(e: any){
            console.log(e);
            ws.send("Failed to send");
        }
    });
});

export {
    httpServer,
    channels,
    wsServer
}