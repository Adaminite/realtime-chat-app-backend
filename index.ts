import { httpServer as server, db } from "./server.js";
import { initializeDatabase } from "./util/db.util.js";

await initializeDatabase(db);

server.listen(process.env.PORT, () => {
    console.log("Listening on port " + process.env.PORT);
});