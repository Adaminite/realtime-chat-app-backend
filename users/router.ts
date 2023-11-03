import express from 'express';
import { db } from '../server.js';
import { hashPassword, HashedPassword } from '../util/auth.util.js';
import { addUser } from '../util/db.util.js';

const router = express.Router();

router.use(express.json());

router.post('/register', (req, res) => {
    const body = req.body;
    console.log(body);

    if(!body["username"] || !body["password"]){
        res.send({err: "Invalid request"});
    }

    const escapedUsername = db.escape(body["username"]);
    let query = 'SELECT * FROM users WHERE username = ' + escapedUsername;
    db.query(query, (err, result: any, fields) => {
        if(err){
            console.log(err);
            res.send({err});
            return;
        }
        if(result.length !== 0){
            res.send({error: "username already exists" });
            return;
        }

        const db_password : HashedPassword = hashPassword(body["password"]);
        
        try{
            addUser(db, escapedUsername, db_password);
            res.send(body);
        } catch (err){
            console.log("caught error");
            console.log(err);
            res.send({err});
        }
    });

    
});

router.post('login', (req, res) => {
    const body = req.body;
    console.log(req.body);
    res.send(body);
});

export {
    router
};