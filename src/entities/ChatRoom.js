const Entity = require("./Entity");
const User =  require("./User");
const database = require("../database/database");
const { uniqueNamesGenerator, adjectives, animals } = require("unique-names-generator");
class ChatRoom extends Entity{

    users = [];
    messages = [];
    name = "";
    
    /**
     * Construct ChatRoom
     * @param {User | Object} constructorArg either the first user or the object used to construct this thing
     */
    constructor(constructorArg){
        if(constructorArg === undefined){
            super("ChatRoom");
            const name = uniqueNamesGenerator({dictionaries: [adjectives, animals], separator: "_", length: 2});
            this.setName(name)
        } else {
            super(constructorArg);
            for(const [key, value] of Object.entries(constructorArg)){
                this[key] = value;
            }
        }
    }

    setName(name){
        this.name = name;
    }

    getName(){
        return this.name;
    }

    /**
     * @param {ChatRoom} room
     * @returns {Array<User>} Array of users in room
     */
    async getUsers(){
        this.users = await database.queryEntityForProperty("User", "chatRoomId", this.getUniqueId());
        return this.users;
    }

    /**
     * Add user to room
     * @param {User} user 
     */
    async addUser(user){
        await database.updateProperty(user, "chatRoomId", this.getUniqueId());
        this.addUser(user);
    }

    /**
     * 
     * @param {User} newUser 
     * @returns {boolean}
     */
    async isDupe(newUser){
        const currentUsers = await this.getUsers();
        for(let i = 0; i < currentUsers.length; i++){
            if(currentUsers[i].username === newUser.username){
                return true;
            }
        }

        return false;
    }
    /**
     * Remove user from room
     * @param {User} user 
     */
    removeUser(user){
        //
    }


    setMessages(messages){
        this.messages = messages;
    }
    /**
     * @async
     * @returns {Array<string>} array of messages in room
     */
    async getMessages(){  
        return this.messages;
    }

    /**
     * 
     * @param {string} message the message that is being posted
     */
    async postMessage(message){
        this.messages.push(message);
        return message;
    }

    /**
     * 
     * @returns {Number} the amount of time remaining in a chat room in seconds
     */
    getTimeRemaining(){
        return this.timeRemaining;
    }
}

module.exports = ChatRoom;