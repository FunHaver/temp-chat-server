const Entity = require("./Entity");
const moment = require("moment");
const entityService = require("../entityService");

class Message extends Entity {
    content = '';
    userId = '';
    chatRoomId = '';
    creationTime = '';
    user = {};
    chatRoom = {};
    constructor(constructorArg){
        if(constructorArg["uniqueId"] === undefined){
            super("Message");
            this.userId = constructorArg["userId"];
            this.chatRoomId = constructorArg["chatRoomId"];
            this.content = constructorArg["content"];
            this.creationTime = moment().toISOString();
        } else {
            super(constructorArg);
            for(const [key, value] of Object.entries(constructorArg)){
                this[key] = value;
            }
        }
    }

    getContent(){
        return this.content;
    }

    getUserId(){
        return this.userId;
    }

    getChatRoomId(){
        return this.chatRoomId;
    }

    getCreationTime(){
        return this.creationTime;
    }

    /**
     * 
     * @returns {ChatRoom}
     */
    async setChatRoom(chatRoom){
        this.chatRoom = chatRoom;
    }

    async setUser(user){
        this.user = user;
    }

}

module.exports = Message;