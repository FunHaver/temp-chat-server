const database = require('../database/database');
const User = require('../entities/User');
const ChatRoom = require('../entities/ChatRoom');
const Message  = require("../entities/Message");
const { getRoomUsers } = require('./userService');
const userService = require('./userService');

class EntityService {
    database;
    classMap = {
        "ChatRoom": ChatRoom,
        "User": User,
        "Message": Message
    }

    constructor(){
        this.database = database;
    }

    /**
     * @async
     * @param {string} username 
     * @returns {Promise<User>}
     */
    async createUser(username){
        let newUser = new User({username: username});
        await this.database.createEntity(newUser, {
            "uniqueId": newUser.getUniqueId(),
            "username": newUser.getUsername()
        });
        let databaseObj = await this.database.readEntity("User", newUser.getUniqueId());
        newUser = new User(databaseObj);
        return newUser;
    }

    /**
     * @async
     * @returns {Promise<ChatRoom>}
     */
    async createChatRoom() {
        let newChatRoom = new ChatRoom();
        await this.database.createEntity(newChatRoom, {
            "uniqueId": newChatRoom.getUniqueId()
        })
        let databaseobj = await this.database.readEntity("ChatRoom", newChatRoom.getUniqueId());
        newChatRoom = new ChatRoom(databaseobj);
        return newChatRoom;
    }

    /**
     * @async
     * @param {User} user 
     * @param {ChatRoom} room 
     */
    async assignUserToRoom(user, room){
        try{
            await room.addUser(user);
        } catch(e){
            throw new Error("Room not found!");
        }
        user.setChatRoomId(room.getUniqueId());
        userService.addUser(user);
    }

    /**
     * @async
     * @param {User} user 
     * @param {ChatRoom} room 
     * @param {string} content 
     */
    async createMessage(user, room, content) {
        let constructorArg = {
            "userId": user.getUniqueId(),
            "chatRoomId": room.getUniqueId(),
            "content": content
        }

        let newMessage = new Message(constructorArg);
        await this.database.createEntity(newMessage, 
            {
                "uniqueId": newMessage.getUniqueId(),
                "content": newMessage.getContent(),
                "userId": newMessage.getUserId(),
                "chatRoomId": newMessage.getChatRoomId(),
                "creationTime": newMessage.getCreationTime()
            });
        let databaseObj = await this.database.readEntity("Message", newMessage.getUniqueId());
        newMessage = new Message(databaseObj);
        newMessage.setUser(user)
        newMessage.setChatRoom(room);
        return newMessage;
    }

    /**
     * 
     * @param {string} classObject 
     * @param {string} uniqueId 
     */
    async getEntity(className, uniqueId){
        let databaseObj = await this.database.readEntity(className, uniqueId);
        if(databaseObj == null){
            return null;
        } else {
            let newClass = this.classMap[className];
            return await new newClass(databaseObj);
        }


    }

    /**
     * 
     * @param {ChatRoom} room 
     */

    async getChatRoomUsers(room){
        room.users = await getRoomUsers(room);
        return room;
    }
    /**
     * 
     * @param {ChatRoom} room 
     */
    async getChatRoomMessages(room) {
        if(room !== null){
            let dbMessages = await database.queryEntityForProperty("Message", "chatRoomId", room.getUniqueId());
            let messageArray = [];
            for(let i = 0; i < dbMessages.length; i++){
                    let message = await this.getEntity("Message", dbMessages[i].uniqueId);
                    message.setUser(await this.getEntity("User", message.getUserId()));
                    message.setChatRoom(await this.getEntity("ChatRoom", message.getChatRoomId()));
                    messageArray.push(message);
            }
            
            room.setMessages(messageArray)
            return room.getMessages();
        } else {
            throw new Error("Room does not exist.");
        }
        
    }
}

module.exports = new EntityService();