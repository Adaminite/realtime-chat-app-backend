import express from 'express';
import { users, channels, db } from '../server.js';
import { addChannelToDatabase, addUserToChannelById, addUserToChannelByUsername, getUserByUsername, getUsersInChannel } from '../util/db.util.js';
import { broadcast } from '../util/message.util.js';

const router = express.Router();

interface channelCreationEvent {
    eventName: "createChannel",
    channelName: string
}

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
        const result = await addChannelToDatabase(db, userId, channelName);
        const channelId = result.insertId;

        await addUserToChannelById(db, userId, channelId);

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

router.post('/adduser', async (req, res) => {
    if(!req.body || !req.body.channelName || !req.body.username || !req.body.channelId){
        res.send({err: "Invalid request: missing parameters"});
        return;
    }

    const channelName = req.body["channelName"];
    const channelId = req.body["channelId"];
    const userToAdd = req.body["username"];

    try{
        const userMatch = await getUserByUsername(db, userToAdd);
        if(userMatch.length === 0){
            throw "User does not exist";
        }

        await addUserToChannelById(db, userMatch[0].id, channelId);
        broadcast({
            "event": "joinChannel",
            "channelName": channelName,
            "channelId": channelId,
            "userId": userMatch[0].id
        }, users, channels);

        res.send({result: "Successfully added user to channel"});

    } catch(err){
        console.log(err);
        res.send({err});
    }
});

export {
    router
};

