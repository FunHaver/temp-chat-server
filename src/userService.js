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
        if(this.userMap[user.chatRoomId] === undefined){
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
     * @param {string} chatRoomId
     * @returns 
     */
    getRoomUsers(chatRoomId){
        return this.userMap[chatRoomId];
    }

    updateAllUsersInRoom(chatRoom, users){
        this.userMap[chatRoom.uniqueId] = users;
    }

    getAllUsers(){
        return this.userMap;
    }

    getSingleUser(userid, chatRoomId){
        let room = this.userMap[chatRoomId];
        for(let i = 0; i < room.length; i++){
            if(room[i]["uniqueId"] === userid){
                return room[i];
            }
        }
    }

    /**
     * 
     * @param {string} userid
     * @param {string} chatRoomId
     * @param {*} res 
     */
    addServerEvent(userid, chatRoomId, res){
        let user = this.getSingleUser(userid, chatRoomId);
        user["push"] = res;
    }
}

module.exports = new UserService();