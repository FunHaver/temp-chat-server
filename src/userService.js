const ChatRoom = require("./entities/ChatRoom");
const User = require("./entities/User");

class UserService {
    userMap = {};

    constructor(){
    }




    /**
     * 
     * @param {User} user 
     */
    addUser(user){
        if(this.userMap[user.chatRoomId] === "undefined"){
            this.userMap[user.chatRoomId] = [user];
        } else {
            this.userMap[user.chatRoomId].push(user);
        }
    }

    /**
     * 
     * @param {User} user 
     */
    removeUser(user){
        let chatRoomUsers = this.userMap[user.chatRoomId];
        for(let i = 0; i < chatRoomUsers.length; i++){
            if(chatRoomUsers[i]["uniqueId"] === chatRoomUsers[i]["uniqueId"]){
               this.userMap[user.chatRoomId][i].splice(i, 1);
               break;
            }
        }
    }

    /**
     * 
     * @param {ChatRoom} chatRoom 
     * @returns 
     */
    getRoomUsers(chatRoom){
        return this.userMap[chatRoom.uniqueId];
    }

    updateAllUsersInRoom(chatRoom, users){
        this.userMap[chatRoom.uniqueId] = users;
    }

    getAllUsers(){
        return this.userMap;
    }
}

module.exports = new UserService();