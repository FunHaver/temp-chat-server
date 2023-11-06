const Entity = require("./Entity");
const User =  require("./User");

class ChatRoom extends Entity{

    users = [];
    messages = [];
    timeRemaining = 600; //seconds
    
    /**
     * Construct ChatRoom
     * @param {User | Object} constructorArg either the first user or the object used to construct this thing
     */
    constructor(constructorArg){
        if(constructorArg === undefined){
            super("ChatRoom")
        } else {
            super(constructorArg);
            for(const [key, value] of Object.entries(constructorArg)){
                this[key] = value;
            }
        }
    }

    /**
     * 
     * @returns {Array<User>} Array of users in room
     */
    getUsers(){
        return this.users;
    }

    /**
     * Add user to room
     * @param {User} user 
     */
    addUser(user){
        this.users.push(user);
    }

    /**
     * Remove user from room
     * @param {User} user 
     */
    removeUser(user){
        this.users.push(user);
    }

    /**
     * 
     * @returns {Array<string>} array of messages in room
     */
    getMessages(){
        return this.messages;
    }

    /**
     * 
     * @param {string} message the message that is being posted
     */
    postMessage(message){
        this.messages.push(message);
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