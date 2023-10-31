import express from 'express';
import ws from 'ws';
import { wsServer, channels } from '../server.js';
const router = express.Router();

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
    }
    res.send({message: "Received"});
});

export {
    router
};

