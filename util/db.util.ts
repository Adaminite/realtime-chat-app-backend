import { Connection } from "mysql2";
import { HashedPassword } from "./auth.util.js";

async function createTables(db: Connection) : Promise<void> {
    await queryDatabase('CREATE TABLE IF NOT EXISTS users' + 
    ' (id BIGINT AUTO_INCREMENT PRIMARY KEY,' +
    ' username VARCHAR(20),' + 
    ' password_hash CHAR(64),' +
    ' salt CHAR(12),' +
    ' email VARCHAR(40),' +
    ' phone_number VARCHAR(20))', db);

    await queryDatabase('CREATE TABLE IF NOT EXISTS channels' + 
    ' (id BIGINT AUTO_INCREMENT PRIMARY KEY,' +
    ' created_by BIGINT,' + 
    ' created_at TIMESTAMP,' + 
    ' name VARCHAR(25),' +
    ' FOREIGN KEY (created_by) REFERENCES users (id))', db);

    await queryDatabase('CREATE TABLE IF NOT EXISTS messages' + 
    ' (id BIGINT AUTO_INCREMENT PRIMARY KEY,' +
    ' time_stamp TIMESTAMP, ' +
    ' sender_id BIGINT, ' + 
    ' receiver_id BIGINT, ' + 
    ' text VARCHAR(2000), ' +
    ' FOREIGN KEY (sender_id) REFERENCES users (id), ' +
    ' FOREIGN KEY (receiver_id) REFERENCES channels (id))', db);

    await queryDatabase('CREATE TABLE IF NOT EXISTS user_to_channel' + 
    ' (id BIGINT AUTO_INCREMENT PRIMARY KEY,' + 
    ' member_id BIGINT,' + 
    ' channel_id BIGINT,' + 
    ' FOREIGN KEY (member_id) REFERENCES users (id),' + 
    ' FOREIGN KEY (channel_id) REFERENCES channels (id))', db);
}

async function initializeDatabase(db : Connection) : Promise<void> {
    db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    db.query(`USE ${process.env.DB_NAME}`);
    await createTables(db);
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

async function addUserToDatabase(db: Connection, username: string, db_password: HashedPassword) : Promise<any>{
    const escapedHash = db.escape(db_password.hash);
    const escapedSalt = db.escape(db_password.salt);

    const query: string = 'INSERT INTO users (username, password_hash, salt) VALUE' +
    ` (${username}, ${escapedHash}, ${escapedSalt})`;

    const result = await queryDatabase(query, db);
    
    return result;
}

async function addChannelToDatabase(db: Connection, userId: number, channelName: string) : Promise<any>{
    const escapedUserId = db.escape(userId);
    const escapedChannelName = db.escape(channelName);

    const query: string = 'INSERT into channels (created_by, created_at, name) VALUE' + 
    ` (${escapedUserId}, CURRENT_TIMESTAMP, ${escapedChannelName})`;

    return await queryDatabase(query, db);
}

async function addUserToChannelById(db: Connection, userId: number, channelId: number): Promise<any>{
    const escapedUserId = db.escape(userId);

    const userMatch = await getUserById(db, userId);

    if(userMatch.length === 0){
        throw "No such user exists";
    }

    const escapedChannelId = db.escape(channelId);

    const validationQuery: string = 'SELECT * FROM user_to_channel' + 
    ` WHERE member_id=${escapedUserId} AND channel_id=${escapedChannelId}`;

    const check = await queryDatabase(validationQuery, db);
    if(check.length !== 0){
        throw "User already a member of this channel";
    }

    const insertQuery: string = 'INSERT INTO user_to_channel (member_id, channel_id) VALUE' + 
    ` (${escapedUserId}, ${escapedChannelId})`;

    return await queryDatabase(insertQuery, db);
}

async function addUserToChannelByUsername(db: Connection, username: string, channelId: number){
    const userMatch = await getUserByUsername(db, username);
    if(userMatch.length === 0){
        throw "No such user exists";
    }

    return await addUserToChannelById(db, Number(userMatch[0].id), channelId);
}

async function addMessageToDatabase(db: Connection, userId: number, channelId: number, message: string){
    const escapedUserId = db.escape(userId);
    const escapedChannelId = db.escape(channelId);
    const escapeedMessage = db.escape(message);
    const insertQuery: string = 'INSERT INTO messages (sender_id, receiver_id, text, time_stamp) VALUE' +
    ` (${escapedUserId}, ${escapedChannelId}, ${escapeedMessage}, CURRENT_TIMESTAMP)`;

    return await queryDatabase(insertQuery, db);
}

async function getUsersInChannel(db: Connection, channelId: number): Promise<any>{
    const escapedChannelId = db.escape(channelId);

    const query: string = 'SELECT member_id, channel_id FROM user_to_channel WHERE ' + 
    ` channel_id=${escapedChannelId}`;

    return await queryDatabase(query, db);
}

async function getMessagesByChannel(db: Connection, channelId: number): Promise<any> {
    const escapedChannelId = db.escape(channelId);
    const query: string = 'SELECT messages.*, users.username FROM messages' +
    ' INNER JOIN users ON messages.sender_id = users.id' + 
    ` WHERE messages.receiver_id=${escapedChannelId}`;
    return await queryDatabase(query, db);
}

async function getUserByUsername(db: Connection, username: string): Promise<any> {
    if(username.length > 20){
        throw "Invalid username";
    }

    const query = 'SELECT * FROM users WHERE username = ' + db.escape(username);

    return await queryDatabase(query, db);
}

async function getUserById(db: Connection, userId: number): Promise<any>{
    const query = 'SELECT * FROM users WHERE id = ' + db.escape(userId);

    return await queryDatabase(query, db);
}

async function getChannelsByUser(db: Connection, userId: number): Promise<any>{
    const query: string = 'SELECT channels.* FROM user_to_channel' +
    ' INNER JOIN channels ON user_to_channel.channel_id = channels.id' + 
    ` WHERE user_to_channel.member_id = ${db.escape(userId)}`;

    return await queryDatabase(query, db);
}   

async function getChannelsAndMessageByUser(db: Connection, userId: number): Promise<any>{
    const query: string = 'SELECT channels.* FROM channels' +
    ' INNER JOIN user_to_channel ON user_to_channel.channel_id = channels.id' +
    ` WHERE user_to_channel.member_id = ${db.escape(userId)}`;

    const userChannels =  await queryDatabase(query, db);

    const result =  await Promise.all(userChannels.map(async (channel: any) => {
        const messagesQuery: string = 'SELECT messages.*, users.username FROM messages' + 
        ' INNER JOIN users ON messages.sender_id = users.id' +
        ` WHERE messages.receiver_id = ${db.escape(channel.id)}`;

        const messages = await queryDatabase(messagesQuery, db);
        
        console.log(messages);

        return {...channel, messages: messages.map((message: any) => {
            return {
                time_stamp: message.time_stamp,
                text: message.text,
                sender: message.username
            }
        })};
    }));

    return result;
}   

export {
    initializeDatabase,
    addUserToDatabase,
    addChannelToDatabase,
    addUserToChannelById,
    addUserToChannelByUsername,
    addMessageToDatabase,
    getUsersInChannel,
    getChannelsByUser,
    getUserByUsername,
    getUserById,
    getMessagesByChannel,
    getChannelsAndMessageByUser,
    queryDatabase
}