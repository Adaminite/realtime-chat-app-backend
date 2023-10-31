import ws from 'ws';
// import {wsServer} from '../server.js';

function broadcast (message : any, wsServer: ws.WebSocketServer) : void {
    for(let client of wsServer.clients){
        client.send(message);
    }
}

export {
    broadcast
}