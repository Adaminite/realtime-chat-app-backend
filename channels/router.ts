import express from 'express';
import { users, channels, db } from '../server.js';
import { addChannel, addUserToChannel, getUsersInChannel } from '../util/db.util.js';
import { broadcast } from '../util/message.util.js';

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

router.get('/:id', async (req, res) => {

    const id = Number(req.params.id);
    if(isNaN(id)){
        res.send({err: "Invalid parameter"});
    }

    res.send({
        result: await getUsersInChannel(db, id)
    });
}); 

router.post('/create', async (req, res) => {

    if(!req.body || !req.body.channelName || !req.body.userId || !req.body.username){
        res.send({err: "Invalid request: missing parameters"});
        return;
    }

    const channelName = req.body["channelName"];
    const userId = req.body["userId"];

    try{
        const result = await addChannel(db, userId, channelName);
        const channelId = result.insertId;

        await addUserToChannel(db, userId, channelId);

        broadcast({
            userId,
            channelName,
            channelId,
            event: "createChannel"
        }, users, channels);

        res.send({
            result: "Successfully added channel"
        });

    } catch(err){
        res.send({err});
    }
});

export {
    router
};

