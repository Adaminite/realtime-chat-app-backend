import express from 'express';
import { db } from '../server.js';
import { hashPassword, HashedPassword } from '../util/auth.util.js';
import { addUserToDatabase, getChannelsAndMessageByUser, getChannelsByUser ,queryDatabase } from '../util/db.util.js';

const router = express.Router();

router.use(express.json());

router.post('/register', async (req, res) => {
    const body = req.body;

    if(!body["username"] || !body["password"]){
        res.send({err: "Invalid request"});
        return;
    }

    const escapedUsername = db.escape(body["username"]);
    let query = 'SELECT * FROM users WHERE username = ' + escapedUsername;

    try{
        const result = await queryDatabase(query, db);

        if(result.length !== 0){
            throw "Username already exists";
        }

        const db_password: HashedPassword = hashPassword(body["password"]);
        const addResult = await addUserToDatabase(db, escapedUsername, db_password);

        res.send({
            user_id: addResult.insertId,
            username: body["username"]
        });
    } catch(err){
        res.send({err});
    }

});

router.post('/login', async (req, res) => {
    const body = req.body;

    if(!body["username"] || !body["password"]){
        res.send({err: "Invalid request"});
        return;
    }

    const escapedUsername = db.escape(body["username"]);
    const attemptedPassword = body["password"];

    try{
        let query = 'SELECT * FROM users WHERE username = ' + escapedUsername;
        const result = await queryDatabase(query, db);
        if(!result.length || result.length === 0){
            throw "User not found";
        }

        const matchedObject = result[0];
        
        const computedHash = hashPassword(attemptedPassword, matchedObject.salt);

        if(computedHash.hash !== matchedObject.password_hash){
            res.send({err: "Invalid username or password"});
            return;
        }

        res.send({
            user_id: matchedObject.id,
            username: matchedObject.username
        });

    } catch(err){
        res.send({err});
    }
});

router.get('/channels/:id', async (req, res) => {
    const id = Number(req.params.id);

    try{
        const queryResult = await getChannelsByUser(db, id);

        res.send({
            channels: queryResult.map((channelObject: any) => {
                return {
                    channelId: channelObject.id,
                    channelName: channelObject.name
                }
            })
        })
    } catch (err){
        res.send({err});
    }

});

router.get('/channelswithmessages/:id', async (req, res) => {
    const id = Number(req.params.id);

    try{
        const queryResult = await getChannelsAndMessageByUser(db, id);
        res.send({
            channels: queryResult.map((channelObject: any) => {
                return { 
                    channelId: channelObject.id,
                    channelName: channelObject.name,
                    messages: channelObject.messages
                }
            })
        })
    } catch (err){
        res.send({err});
    }
});

export {
    router
};