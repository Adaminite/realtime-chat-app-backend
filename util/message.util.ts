import { webSocket } from '../server.js';

interface broadcastMessageEvent {
    "eventName" : "receiveMessage",
    "message": string,
    "channelName": string
}

function broadcast (message : any, users: Map<string, Set<webSocket>>, channels: Map<string, Set<string>> ) : void {
    const usersInChannel = channels.get(message["channelName"]) || new Set<string>();
    for(let user of usersInChannel){
        const sockets = users.get(user) || new Set<webSocket>();
        for(let socket of sockets){
            socket.send(JSON.stringify({
                "eventName": "receiveMessage",
                "message": message["message"],
                "channelName": message["channelName"]
            }));
        }
    }
}

export {
    broadcast
}