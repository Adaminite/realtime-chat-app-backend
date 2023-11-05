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
        res.send({result: await getMessagesByChannel(db, id)});
        
    } catch(err){
        res.send({err});
    }
});



export{
    router
};