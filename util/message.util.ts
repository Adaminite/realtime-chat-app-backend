import { webSocket } from '../server.js';

interface broadcastMessageEvent {
    "eventName" : "receiveMessage",
    "message": string,
    "channelName": string
}

function broadcast (message : any, users: Map<number, Set<webSocket>>, channels: Map<number, Set<number>> ) : void {
    if(message["event"] === "broadcastMessage"){
        broadcastMessage(message, users, channels);
    } else if(message["event"] === "createChannel"){
        broadcastChannelCreation(message, users, channels);
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
                "channelName": message["channelName"],
                "channelId": Number(message["channelId"])
            }));
        }
    }
}

function broadcastChannelCreation(message: any, users: Map<number, Set<webSocket>>, channels: Map<number, Set<number>>): void {
    if(isNaN(Number(message["channelId"])) || !message["channelName"]){
        throw "Invalid channel metadata";
    }

    if(isNaN(Number(message["userId"]))){
        throw "Missing user id for channel creation";
    }

    const sockets = users.get(message["userId"]) || new Set<webSocket>();
    for(let socket of sockets){
        socket.send(JSON.stringify({
            "eventName": "createChannel",
            "channelName": message["channelName"],
            "channelId": Number(message["channelId"]) 
        }));
    }
}   

export {
    broadcast
}