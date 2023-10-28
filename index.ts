import express from 'express';
import {IncomingMessage, Server, createServer} from 'http';
import ws, { WebSocketServer } from 'ws';

// const wssServer: ws.WebSocketServer

const app: express.Application = express();


app.use("/", (req, res) => {
    res.send("Hello");
});


const httpServer: Server = createServer(app);

const wsServer: ws.WebSocketServer = new WebSocketServer({server: httpServer});

wsServer.on('connection', (ws: ws.WebSocket, req: IncomingMessage) => {
    console.log(req);

    ws.on('message', (data: ws.RawData, isBinary: boolean) => {
        ws.send(data);
    });
});

httpServer.listen(3000);
