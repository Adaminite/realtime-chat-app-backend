# Realtime Chat Application

This application is an attempt at implementing an instant messaging application using WebSockets. The intended clients are a web client, an Android client, and an iOS client.  

Notice: A basic web client has been implemented. Plans to develop an Android or iOS client for the application are unlikely and/or no longer intended to be worked on.

## Disclaimer

Some of the Git commits/changes in the history may appear out of order of when they were actually implemented/introduced. This is likely because I may have worked for an extended period of time without committing changes and thus commit files accordingly to attempt to reflect individual/independent additions/changes.

## Some Important Decisions

1. Wanted to learn Go and add it to my toolset. However, after some pondering, a Medium article by Matt Tomasetti (https://matttomasetti.medium.com/websocket-performance-comparison-10dc89367055) influenced me to use NodeJS due to it seeming to outperform Go. Messaging applications are request heavy, so NodeJS is a solid choice.

2. Intended plan is to use Kotlin (Android) and Swift (iOS) to implement the mobile clients. Dart + Flutter is a great option, but for learning purposes, I felt that working with more native languages would be more fruitful. (Notice: see second paragraph under 'Realtime Chat Application')

3. Initially, Cassandra for a DB seemed to be ideal. It was the database of choice for Discord (https://discord.com/blog/how-discord-stores-trillions-of-messages), with one of the reasons being it great for write-heavy use cases. Discord later switched to ScyllaDB. However, I opted for MySQL, because I have limited experience working with relational databases, so I thought select a database like MySQL would be really helpful. In essence, I picked MySQL to learn how to work with a relational database. 

4. Using a project management tool (Plane, which is open source) to help me keep track of the project. It is a large project with a lot of moving parts, so I thought it would be greatly beneficial for me as a developer
    * Notice: Plane wasn't ultimately used too much. 

## Specifications (TBD)

### Initiative

1. An instant messaging app capable of sending messages both to individual users and groups in near real time. 
    * Notice: no 'DM' feature will likely be implemented. Individual messaging can be achieved using the existing application functionality

### Epics

1. A dynamic, stylish, responsive user interface 
    * Notice: The UI is slightly responsive and has a very simple design. However, I would consider the application to be dynamic.

2. A backend server that can handle both HTTP requests and WebSocket requests

### User Stories

1. I want the ability to choose a unique username

2. I want to be able to sign in/register using a 3rd party identity provider (e.g. Google) (no longer doing and/or unlikely)

3. I want to be able to sign back in, and keep my user name

4. I want to be able to send messages to individual users (no longer doing and/or unlikely; can be effectively achieved using current application functionality, but no dedicated 'DM' feature)

5. I want to be able to send messages to a group

6. I want to be able to receive messages

7. I want the message history for each conversation to be persisted

8. I want my session to persist between refreshes and browser closes (TBD; web client specific) (no longer doing and/or unlikely)

9. I want the UI to be responsive (TBD) (no longer doing and/or unlikely)

10. I want the UI to be accessible (TBD) (no longer doing and/or unlikely)

### Database Design (MySQL)

#### Users Table
* id (primary key): BIGINT
* username: VARCHAR(20)
* password_hash: CHAR(64); size depends on the resulting salt + hash size + auth method. Likely a hash such as SHA-256, so CHAR would need 32 bytes to store in that case.
* salt: CHAR(12); fixed size and depends on the salt size
* email: VARCHAR(40)
* phone_number: VARCHAR(20)

#### Channels Table
* id (primary): BIGINT
* created_by: BIGINT
* created_at: TIMESTAMP
* name: VARCHAR(25)


#### Messages Table
* id (primary key): BIGINT
* time_stamp: TIMESTAMP
* sender_id: BIGINT
* receiver_id: BIGINT
* text: VARCHAR(2000)

#### User to Channel Table
* id (primary key): BIGINT
* member_id: BIGINT
* channel_id: BIGINT


#### Important Questions to Consider
1. How to handle the one user to many channels and one channel to many users bidirectional relationship?
    * Use a table to store the user <-> channel mappings

2. How to move the storage of users to WebSockets outside of the server's memory, if important?
    * Ultimately stored this information in the servers' memory. Could probably use a fast in-memory DB like Redis to accomplish this to allow the server to use less memory.

3. (Web Frontend) How to pass state from parent to child when using Angular routing
    * Use an injectable service that stores the state, inject it into the components, and have event emitters + subscriptions to update state within the components

## Technologies + Skills

* Angular
* HTML
* CSS
* Node.js
* Express.js
* WebSockets (via 'ws', a Node.js WebSocket library)
* MySQL









