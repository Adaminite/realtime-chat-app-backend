import express from 'express';
import { db } from '../server.js';
import { getMessagesByChannel } from '../util/db.util.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if(isNaN(id)){
        res.send({err: "Invalid parameter"});
    }

    try{
        const queryResult = await getMessagesByChannel(db, id);
        const messages = queryResult.map((messageObj: any) => {
            return {
                text: messageObj["text"],
                time_stamp: messageObj["time_stamp"],
                sender: messageObj["username"]
            }
        });

        res.send({messages});
    } catch(err){
        res.send({err});
    }
});



export{
    router
};