# Realtime Chat Application

This application is an attempt at implementing an instant messaging application using the WebSocket protocol. The intended clients are a web client, an Android client, and an iOS client.  

## Some Important Decisions

1. Wanted to learn Go and add it to my toolset. However, after some pondering, a Medium article by Matt Tomasetti (https://matttomasetti.medium.com/websocket-performance-comparison-10dc89367055) influenced me to use NodeJS due to it seeming to outperform Go. Messaging applications are request heavy, so NodeJS is a solid choice.

2. Intended plan is to use Kotlin (Android) and Swift (iOS) to implement the mobile clients. Dart + Flutter is a great option, but for learning purposes, I felt that working with more native languages would be more fruitful.

3. Initially, Cassandra for a DB seemed to be ideal. It was the database of choice for Discord (https://discord.com/blog/how-discord-stores-trillions-of-messages), with one of the reasons being it great for write-heavy use cases. Discord later switched to ScyllaDB. However, I opted for MySQL, because I have limited experience working with relational databases, so I thought select a database like MySQL would be really helpful. In essence, I picked MySQL to learn how to work with a relational database. 

4. Using a project management tool (Plane, which is open source) to help me keep track of the project. It is a large project with a lot of moving parts, so I thought it would be greatly beneficial for me as a developer

## Specifications (TBD)

### Initiative

1. An instant messaging app capable of sending messages both to individual users and groups in near real time.

### Epics

1. A dynamic, stylish, responsive user interface 

2. A backend server that can handle both HTTP requests and WebSocket requests

### User Stories

1. I want the ability to choose a unique username

2. I want to be able to sign in/register using a 3rd party identity provider (e.g. Google)

3. I want to be able to sign back in, and keep my user name

4. I want to be able to send messages to individual users

5. I want to be able to send messages to a group

6. I want to be able to receive messages

7. I want the message history for each conversation to be persisted

8. I want my session to persist between refreshes and browser closes (TBD; web client specific)

9. I want the UI to be responsive (TBD)

10. I want the UI to be accessible (TBD)

## Technologies + Skills (Planned/Intended)

* Node.js
* Express.js
* Angular
* WebSockets 
* SQL (MySQL)
* Kotlin
* Swift
* Docker?





