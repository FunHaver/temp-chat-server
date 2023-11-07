const Entity = require("./Entity");

class User extends Entity {
    username = '';
    chatRoomId = '';
    /**
     * Construct user
     * @param {Object} constructorArg for new instances, an object like so 
     * {
     *   "username": "foo"
     * }
     * uniqueId MUST NOT be a property on that object for it to be new
     */
    constructor(constructorArg){
        if(constructorArg["uniqueId"] === undefined){
            super("User");
            this.username = constructorArg["username"];
        } else {
            super(constructorArg);
            for(const [key, value] of Object.entries(constructorArg)){
                this[key] = value;
            }
        }
    }

    /**
     * 
     * @returns {string} username
     */
    getUsername(){
        return this.username;
    }

    setUsername(username){
        this.username = username;
    }

    /**
     * Set chat room id
     * @param {string} id 
     */
    setChatRoomId(id){
        this.chatRoomId = id;
    }

    /**
     * 
     * @returns {string} chat room id
     */
    getChatRoomId(){
        return this.chatRoomId;
    }
}

module.exports = User;