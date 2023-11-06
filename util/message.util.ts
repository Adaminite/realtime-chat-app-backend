import { webSocket } from '../server.js';

interface broadcastMessageEvent {
    "eventName" : "receiveMessage",
    "message": string,
    "channelName": string
}

function broadcast (message : any, users: Map<number, Set<webSocket>>, channels: Map<number, Set<number>> ) : void {
    if(message["event"] === "broadcastMessage"){
        broadcastMessage(message, users, channels);
    } else if(message["event"] === "joinChannel"){
        broadcastChannelJoin(message, users, channels);
    } else{
        throw "Invalid message event";
    }

}

function broadcastMessage(message: any, users: Map<number, Set<webSocket>>, channels: Map<number, Set<number>>) : void {
    
    if(isNaN(Number(message["channelId"]))){
        throw "Invalid channel id";
    }

    const usersInChannel = channels.get(Number(message["channelId"])) || new Set<number>();
    for(let user of usersInChannel){
        const sockets = users.get(user) || new Set<webSocket>();
        for(let socket of sockets){
            socket.send(JSON.stringify({
                "eventName": "receiveMessage",
                "message": message["message"],
                "sender": message["sender"],
                "time_stamp": message["time_stamp"],
                "channelName": message["channelName"],
                "channelId": Number(message["channelId"])
            }));
        }
    }
}

function broadcastChannelJoin(message: any, users: Map<number, Set<webSocket>>, channels: Map<number, Set<number>>): void {
    if(isNaN(Number(message["channelId"])) || !message["channelName"]){
        throw "Invalid channel metadata";
    }

    if(isNaN(Number(message["userId"]))){
        throw "Missing user id for channel creation";
    }

    const channelId = Number(message["channelId"]);
    const userId = Number(message["userId"]);
    if(!channels.has(channelId)){
        channels.set(channelId, new Set<number>());
    }

    channels.get(channelId)?.add(userId);

    const sockets = users.get(userId) || new Set<webSocket>();
    for(let socket of sockets){
        socket.send(JSON.stringify({
            "eventName": "joinChannel",
            "channelName": message["channelName"],
            "channelId": Number(message["channelId"]) 
        }));
    }
}   

export {
    broadcast
}