import { Connection } from "mysql2";
import { HashedPassword } from "./auth.util.js";

function createTables(db: Connection) : void {
    db.query('CREATE TABLE IF NOT EXISTS users' + 
        ' (id BIGINT AUTO_INCREMENT PRIMARY KEY,' +
        ' username VARCHAR(20),' + 
        ' password_hash CHAR(64),' +
        ' salt CHAR(12),' +
        ' email VARCHAR(40),' +
        ' phone_number VARCHAR(20))', (err) => {
            console.log(err);
        });

    db.query('CREATE TABLE IF NOT EXISTS channels' + 
        ' (id BIGINT AUTO_INCREMENT PRIMARY KEY,' +
        ' created_by BIGINT,' + 
        ' created_at TIMESTAMP,' + 
        ' name VARCHAR(25),' +
        ' FOREIGN KEY (created_by) REFERENCES users (id))', (err) => {
            console.log(err);
        });
    
    db.query('CREATE TABLE IF NOT EXISTS messages' + 
        ' (id BIGINT AUTO_INCREMENT PRIMARY KEY,' +
        ' time_stamp TIMESTAMP, ' +
        ' sender_id BIGINT, ' + 
        ' receiver_id BIGINT, ' + 
        ' text VARCHAR(2000), ' +
        ' FOREIGN KEY (sender_id) REFERENCES users (id), ' +
        ' FOREIGN KEY (receiver_id) REFERENCES channels (id))', (err) => {
            console.log(err);
        });
    
    db.query('CREATE TABLE IF NOT EXISTS user_to_channel' + 
        ' (id BIGINT AUTO_INCREMENT PRIMARY KEY,' + 
        ' member_id BIGINT,' + 
        ' channel_id BIGINT,' + 
        ' FOREIGN KEY (member_id) REFERENCES users (id),' + 
        ' FOREIGN KEY (channel_id) REFERENCES channels (id))', (err) => {
            console.log(err);
        });    
}
function initializeDatabase(db : Connection) : void {
    db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    db.query(`USE ${process.env.DB_NAME}`);
    createTables(db);
}

async function queryDatabase(query: string, db: Connection): Promise<any>{
    return new Promise((resolve, reject) => {
        db.query(query, (error, result: any, fields) => {
            if(error){
                reject(error);
            }
            resolve(result);
        })
    });
}

async function addUser(db: Connection, username: string, db_password: HashedPassword) : Promise<any>{
    const escapedHash = db.escape(db_password.hash);
    const escapedSalt = db.escape(db_password.salt);

    const query: string = 'INSERT INTO users (username, password_hash, salt) VALUE' +
    ` (${username}, ${escapedHash}, ${escapedSalt})`;

    const result = await queryDatabase(query, db);
    
    return result;
}

async function addChannel(db: Connection, userId: number, channelName: string) : Promise<any>{
    const escapedUserId = db.escape(userId);
    const escapedChannelName = db.escape(channelName);

    const query: string = 'INSERT into channels (created_by, created_at, name) VALUE' + 
    ` (${escapedUserId}, CURRENT_TIMESTAMP, ${escapedChannelName})`;

    return await queryDatabase(query, db);
}

async function addUserToChannel(db: Connection, userId: number, channelId: number): Promise<any>{
    const escapedUserId = db.escape(userId);
    const escapedChannelId = db.escape(channelId);

    const validationQuery: string = 'SELECT * FROM user_to_channel WHERE ' + 
    ` member_id=${escapedUserId} AND channel_id=${escapedChannelId}`;

    const check = await queryDatabase(validationQuery, db);
    if(check.length !== 0){
        throw "User already a member of this channel";
    }

    const insertQuery: string = 'INSERT INTO user_to_channel (member_id, channel_id) VALUE' + 
    ` (${escapedUserId}, ${escapedChannelId})`;

    return await queryDatabase(insertQuery, db);
}

async function getUsersInChannel(db: Connection, channelId: number){
    const escapedChannelId = db.escape(channelId);

    const query: string = 'SELECT member_id, channel_id FROM user_to_channel WHERE ' + 
    ` channel_id=${escapedChannelId}`;

    return await queryDatabase(query, db);
}

export {
    initializeDatabase,
    addUser,
    addChannel,
    addUserToChannel,
    getUsersInChannel,
    queryDatabase
}