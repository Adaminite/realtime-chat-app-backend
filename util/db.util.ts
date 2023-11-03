import { Connection } from "mysql2";

function createTables(db: Connection) : void {
    db.query('CREATE TABLE IF NOT EXISTS users' + 
        ' (id BIGINT AUTO_INCREMENT PRIMARY KEY,' +
        ' username VARCHAR(20),' + 
        ' password_hash CHAR(32),' +
        ' salt CHAR(12),' +
        ' email VARCHAR(40),' +
        ' phone_number VARCHAR(20))', (err) => {
            console.log(err);
        });

    db.query('CREATE TABLE IF NOT EXISTS channels' + 
        ' (id BIGINT AUTO_INCREMENT PRIMARY KEY,' +
        ' created_by BIGINT,' + 
        ' created_at TIMESTAMP,' + 
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


export {
    initializeDatabase
}