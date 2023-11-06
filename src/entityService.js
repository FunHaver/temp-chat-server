const database = require('./database/database');
const User = require('./entities/User');
const ChatRoom = require('./entities/ChatRoom');

class EntityService {
    database;
    classMap = {
        "ChatRoom": ChatRoom,
        "User": User
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
            await this.database.updateProperty(user, "chatRoomId", room.getUniqueId());
        } catch(e){
            throw new Error("Room not found!");
        }
        user.setChatRoomId(room.getUniqueId());

    }

    /**
     * 
     * @param {string} classObject 
     * @param {string} uniqueId 
     */
    async getEntity(className, uniqueId){
        let databaseObj = await this.database.readEntity(className, uniqueId);
        let newClass = this.classMap[className];
        return new newClass(databaseObj);
    }
}

module.exports = new EntityService();