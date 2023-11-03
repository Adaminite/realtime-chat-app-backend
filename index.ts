import { httpServer as server, db } from "./server.js";

server.listen(3000, () => {

    db.query('CREATE DATABASE IF NOT EXISTS testing', (err) => {
        if(err){
            console.log(err);
            return;
        }

        console.log("Successfully created DB");
    });

});
