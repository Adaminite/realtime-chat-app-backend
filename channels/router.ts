import express from 'express';
import { users, channels } from '../server.js';
const router = express.Router();

interface channelCreationEvent {
    eventName: "createChannel",
    channelName: string
}

router.use((req, res, next) => {
    console.log("In channels router");
    next();
});

router.use(express.json());

router.get('/', (req, res) => {

});

router.post('/create', (req, res) => {
    if(req.body && req.body.channelName){
        channels.set(req.body.channelName, new Set<string>());

        users.forEach((value, key) => {
            value.forEach((socket) => {
                const message : channelCreationEvent = {
                    channelName: req.body.channelName,
                    eventName: "createChannel"
                }

                socket.send(JSON.stringify(message));
            });

            channels.get(req.body.channelName)?.add(key);
        });
    }

    res.send({message: "Received"});
});

export {
    router
};

